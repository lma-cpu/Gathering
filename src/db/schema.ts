import { pgTable, text, timestamp, varchar, uuid, jsonb } from 'drizzle-orm/pg-core';

export const hangoutSessions = pgTable('hangout_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  creatorName: text('creator_name').notNull(),
  city: text('city').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('collecting'), // 'collecting' | 'finalized'
  title: text('title'),
  dateRange: text('date_range'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const friendResponses = pgTable('friend_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => hangoutSessions.id).notNull(),
  friendName: text('friend_name').notNull(),
  availableSlots: jsonb('available_slots').$type<string[]>().notNull(),
  chosenVibes: text('chosen_vibes').array().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const finalItineraries = pgTable('final_itineraries', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => hangoutSessions.id).notNull(),
  selectedDate: text('selected_date').notNull(),
  selectedTime: text('selected_time').notNull(),
  venueName: text('venue_name').notNull(),
  venueAddress: text('venue_address').notNull(),
  googleMapsUrl: text('google_maps_url').notNull(),
  weatherCondition: text('weather_condition').notNull(),
  aiReasoning: text('ai_reasoning').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
