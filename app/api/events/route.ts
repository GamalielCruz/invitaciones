import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sanityClient } from '@/lib/sanity'

/**
 * GET /api/events
 * 
 * Retrieves all events for the authenticated user.
 * Events are filtered by ownerClerkId and excludes archived events by default.
 * 
 * Query Parameters:
 * - includeArchived: boolean (optional) - Include archived events in results
 * 
 * Returns:
 * - 200: Array of event objects
 * - 401: Unauthorized (user not authenticated)
 * - 500: Internal server error
 */
export async function GET(req: Request) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const includeArchived = searchParams.get('includeArchived') === 'true'

    // Build GROQ query
    const archivedFilter = includeArchived ? '' : '&& !isArchived'
    const query = `
      *[_type == "event" && ownerClerkId == $clerkId ${archivedFilter}] | order(createdAt desc) {
        _id,
        _createdAt,
        title,
        slug,
        eventType,
        eventDate,
        template,
        location,
        ceremonyLocation,
        receptionLocation,
        giftRegistry,
        customImages,
        contactInfo,
        ownerClerkId,
        isArchived,
        createdAt,
        updatedAt
      }
    `

    // Fetch events from Sanity
    const events = await sanityClient.fetch(query, { clerkId: userId })

    return NextResponse.json(events, { status: 200 })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/events
 * 
 * Creates a new event for the authenticated user.
 * Automatically generates a unique slug from the title.
 * 
 * Request Body:
 * - title: string (required)
 * - eventType: string (required) - 'wedding' | 'birthday' | 'quinceañera' | 'other'
 * - eventDate: string (required) - ISO date string
 * - template: string (required) - 'isla/0' | 'isla/1' | 'isla/2' | 'isla/4' | 'isla/5' | 'isla/6'
 * - location: object (optional)
 * - ceremonyLocation: object (optional)
 * - receptionLocation: object (optional)
 * - giftRegistry: object (optional)
 * - customImages: object (optional)
 * - contactInfo: object (optional)
 * 
 * Returns:
 * - 201: Created event object
 * - 400: Bad request (validation error)
 * - 401: Unauthorized (user not authenticated)
 * - 409: Conflict (slug already exists)
 * - 500: Internal server error
 */
export async function POST(req: Request) {
  try {
    // Authenticate user with Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const {
      title,
      eventType,
      eventDate,
      template,
      location,
      ceremonyLocation,
      receptionLocation,
      giftRegistry,
      customImages,
      contactInfo,
    } = body

    // Validate required fields
    if (!title || !eventType || !eventDate || !template) {
      return NextResponse.json(
        { error: 'Missing required fields: title, eventType, eventDate, template' },
        { status: 400 }
      )
    }

    // Validate eventType
    const validEventTypes = ['wedding', 'birthday', 'quinceañera', 'other']
    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate template
    const validTemplates = ['isla/0', 'isla/1', 'isla/2', 'isla/4', 'isla/5', 'isla/6']
    if (!validTemplates.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Must be one of: ${validTemplates.join(', ')}` },
        { status: 400 }
      )
    }

    // Generate slug from title
    const { generateUniqueSlug } = await import('@/lib/utils/slug')
    const baseSlug = generateUniqueSlug(title, false)

    // Check if slug already exists
    const existingEvent = await sanityClient.fetch(
      `*[_type == "event" && slug.current == $slug][0]`,
      { slug: baseSlug }
    )

    // If slug exists, add random suffix
    const finalSlug = existingEvent ? generateUniqueSlug(title, true) : baseSlug

    // Get user reference from Sanity
    const userQuery = `*[_type == "user" && clerkId == $clerkId][0]._id`
    const userRef = await sanityClient.fetch(userQuery, { clerkId: userId })

    if (!userRef) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Create event document
    const eventDoc = {
      _type: 'event',
      title,
      slug: {
        _type: 'slug',
        current: finalSlug,
      },
      eventType,
      eventDate,
      template,
      location: location || null,
      ceremonyLocation: ceremonyLocation || null,
      receptionLocation: receptionLocation || null,
      giftRegistry: giftRegistry || { enabled: false },
      customImages: customImages || null,
      contactInfo: contactInfo || null,
      owner: {
        _type: 'reference',
        _ref: userRef,
      },
      ownerClerkId: userId,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Create event in Sanity
    const createdEvent = await sanityClient.create(eventDoc)

    console.log('Event created successfully:', createdEvent._id)

    return NextResponse.json(createdEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
