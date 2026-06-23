export type SessionStatus = "collecting" | "finalized";

export type HangoutSession = {
  id: string;
  creator_name: string;
  city: string;
  title: string | null;
  date_range: string | null;
  status: SessionStatus;
  creator_id: string | null;
  created_at: string;
};

export type FriendResponse = {
  id: string;
  session_id: string;
  friend_name: string;
  available_slots: string[];
  chosen_vibes: string[];
  created_at: string;
};

export type FinalItinerary = {
  id: string;
  session_id: string;
  selected_date: string;
  selected_time: string;
  venue_name: string;
  venue_address: string;
  google_maps_url: string;
  weather_condition: string;
  ai_reasoning: string;
  created_at: string;
};
