import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

/**
 * GET /api/events/[id]
 * 
 * Retrieves an event by its ID (public endpoint).
 * 
 * Path Parameters:
 * - id: string (required) - Sanity document ID
 * 
 * Returns:
 * - 200: Event object
 * - 404: Event not found
 * - 500: Internal server error
 */
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Query event with all fields including images
    const query = `*[_type == "event" && _id == $id][0]{
      _id,
      title,
      slug,
      description,
      eventType,
      eventDate,
      template,
      theme,
      customIcon{
        asset->{
          _id,
          url
        },
        alt
      },
      heroImage{
        asset->{
          _id,
          url
        },
        alt
      },
      gallery[]{
        asset->{
          _id,
          url
        },
        caption
      },
      backgroundMusic{
        asset->{
          _id,
          url
        }
      },
      showCountdown,
      itinerary,
      parents,
      godparents,
      location,
      ceremonyLocation,
      receptionLocation,
      giftRegistry,
      customImages,
      contactInfo,
      rsvpEnabled,
      rsvpDeadline
    }`

    const event = await sanityClient.fetch(query, { id })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event, { status: 200 })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/events/[id]
 * 
 * Updates an existing event.
 * Supports two authentication methods:
 * 1. Clerk authentication (user must own the event)
 * 2. Admin token authentication (for admin panel)
 * 
 * Path Parameters:
 * - id: string (required) - Sanity document ID
 * 
 * Request Body (all fields optional):
 * - title: string
 * - slug: object - { current: string }
 * - eventType: string - 'wedding' | 'birthday' | 'quinceañera' | 'other'
 * - eventDate: string - ISO date string
 * - template: string - 'isla/0' | 'isla/1' | 'isla/2' | 'isla/4' | 'isla/5' | 'isla/6'
 * - location: object
 * - ceremonyLocation: object
 * - receptionLocation: object
 * - giftRegistry: object
 * - customImages: object
 * - contactInfo: object
 * - adminToken: string (optional) - Admin authentication token
 * 
 * Returns:
 * - 200: Updated event object
 * - 400: Bad request (validation error)
 * - 401: Unauthorized (user not authenticated)
 * - 403: Forbidden (user is not the owner)
 * - 404: Event not found
 * - 500: Internal server error
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get event ID from params
    const { id } = await params

    // Parse request body
    const body = await req.json()
    const { adminToken, ...updateFields } = body

    // Check for admin token authentication
    const isAdminAuth = adminToken === process.env.ADMIN_TOKEN

    // If not admin, check Clerk authentication
    let userId: string | null = null
    if (!isAdminAuth) {
      const authResult = await auth()
      userId = authResult.userId

      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    // Check if event exists
    const existingEvent = await sanityClient.fetch(
      `*[_type == "event" && _id == $id][0]`,
      { id }
    )

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify ownership (skip if admin)
    if (!isAdminAuth && existingEvent.ownerClerkId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this event' },
        { status: 403 }
      )
    }
    // Validate eventType if provided
    if (updateFields.eventType) {
      const validEventTypes = ['wedding', 'birthday', 'quinceañera', 'other']
      if (!validEventTypes.includes(updateFields.eventType)) {
        return NextResponse.json(
          { error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Validate template if provided
    if (updateFields.template) {
      const validTemplates = ['isla/0', 'isla/1', 'isla/2', 'isla/4', 'isla/5', 'isla/6']
      if (!validTemplates.includes(updateFields.template)) {
        return NextResponse.json(
          { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Build update object (only include provided fields)
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    }

    // Add all provided fields to update
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        updateData[key] = updateFields[key]
      }
    })

    // Update event in Sanity
    const updatedEvent = await sanityClient
      .patch(id)
      .set(updateData)
      .commit()

    console.log('Event updated successfully:', id)

    return NextResponse.json(updatedEvent, { status: 200 })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/events/[id]
 * 
 * Soft deletes an event by marking it as archived.
 * Only the event owner can delete their events.
 * 
 * Path Parameters:
 * - id: string (required) - Sanity document ID
 * 
 * Returns:
 * - 200: Success message
 * - 401: Unauthorized (user not authenticated)
 * - 403: Forbidden (user is not the owner)
 * - 404: Event not found
 * - 500: Internal server error
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get event ID from params
    const { id } = await params

    // Check if event exists and user is the owner
    const existingEvent = await sanityClient.fetch(
      `*[_type == "event" && _id == $id][0]`,
      { id }
    )

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existingEvent.ownerClerkId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this event' },
        { status: 403 }
      )
    }

    // Soft delete: mark as archived
    await sanityClient
      .patch(id)
      .set({
        isArchived: true,
        updatedAt: new Date().toISOString(),
      })
      .commit()

    console.log('Event archived successfully:', id)

    return NextResponse.json(
      { message: 'Event archived successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error archiving event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
