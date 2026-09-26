declare module 'pusher' {
  interface PusherServerOptions {
    appId: string;
    key: string;
    secret: string;
    cluster: string;
    useTLS?: boolean;
    host?: string;
    port?: number;
  }

  interface PusherClientOptions {
    cluster?: string;
    authEndpoint?: string;
    auth?: {
      headers?: Record<string, string>;
      params?: Record<string, string>;
    };
    authTransport?: 'ajax' | 'jsonp';
    activityTimeout?: number;
    pongTimeout?: number;
    unavailableTimeout?: number;
    enableStats?: boolean;
    httpHost?: string;
    httpPort?: number;
    httpsPort?: number;
    wsHost?: string;
    wsPort?: number;
    wssPort?: number;
    forceTLS?: boolean;
    enabledTransports?: ('ws' | 'xhr_streaming' | 'xhr_polling')[];
    disabledTransports?: ('ws' | 'xhr_streaming' | 'xhr_polling')[];
  }

  interface AuthResponse {
    auth: string;
    channel_data?: string;
  }

  interface Channel {
    name: string;
    bind(eventName: string, callback: (data: any) => void): this;
    unbind(eventName?: string, callback?: (data: any) => void): this;
  }

  interface Connection {
    bind(event: string, callback: (...args: any[]) => void): this;
    unbind(event: string, callback?: (args: any[]) => void): this;
  }

  class Pusher {
    constructor(options: PusherServerOptions);
    constructor(key: string, options?: PusherClientOptions);
    connection: Connection;
    subscribe(channelName: string): Channel;
    unsubscribe(channelName: string): void;
    disconnect(): void;
    send_event(channelName: string, eventName: string, data: any): Promise<void>;
    trigger(channelName: string, eventName: string, data: any): Promise<void>;
    authenticate(socketId: string, channel: string, channelData?: string): AuthResponse;
  }

  export default Pusher;
}