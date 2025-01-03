export interface VolumeData {
  masters: Masters;
  devices: Devices;
}

export interface Masters {
  stream: Stream;
  classic: Classic;
}

export interface Stream {}

export interface Classic {
  volume: number;
  muted: boolean;
}

export interface Devices {
  game: Game;
  chatRender: ChatRender;
  chatCapture: ChatCapture;
  media: Media;
  aux: Aux;
}

export interface Game {
  stream: Stream2;
  classic: Classic2;
}

export interface Stream2 {}

export interface Classic2 {
  volume: number;
  muted: boolean;
}

export interface ChatRender {
  stream: Stream3;
  classic: Classic3;
}

export interface Stream3 {}

export interface Classic3 {
  volume: number;
  muted: boolean;
}

export interface ChatCapture {
  stream: Stream4;
  classic: Classic4;
}

export interface Stream4 {}

export interface Classic4 {
  volume: number;
  muted: boolean;
}

export interface Media {
  stream: Stream5;
  classic: Classic5;
}

export interface Stream5 {}

export interface Classic5 {
  volume: number;
  muted: boolean;
}

export interface Aux {
  stream: Stream6;
  classic: Classic6;
}

export interface Stream6 {}

export interface Classic6 {
  volume: number;
  muted: boolean;
}
