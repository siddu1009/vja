export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface VistaEvent {
  event: string;
  class: string;
  object_id: string;
  location_zone: string;
  duration?: string;
}

export interface VistaData {
  timestamp: string;
  status: 'Scanning' | 'Event' | 'Nominal';
  scene_summary: {
    objects_detected: number;
    threat_level: string;
  };
  new_events?: VistaEvent[];
}

export interface SystemStatus {
  security: string;
  [key: string]: string | number;
}