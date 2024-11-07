import * as fs from 'fs';
import * as path from 'path';
import streamDeck from "@elgato/streamdeck";
import axios from 'axios';
import * as https from 'https';

class ServerNotAccessibleError extends Error {
    constructor(status: number) {
        super(`Server not accessible. Status: ${status}`);
    }
}

class EnginePathNotFoundError extends Error {}
class SonarNotEnabledError extends Error {}
class ServerNotReadyError extends Error {}
class ServerNotRunningError extends Error {}
class WebServerAddressNotFoundError extends Error {}
class ChannelNotFoundError extends Error {
    constructor(channel: string) {
        super(`Channel not found: ${channel}`);
    }
}
class SliderNotFoundError extends Error {
    constructor(slider: string) {
        super(`Slider not found: ${slider}`);
    }
}
class InvalidVolumeError extends Error {
    constructor(volume: number) {
        super(`Invalid volume: ${volume}`);
    }
}
class InvalidMixVolumeError extends Error {
    constructor(volume: number) {
        super(`Invalid mix volume: ${volume}`);
    }
}

// Create an axios instance allowing self-signed certificates
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false  // Allow self-signed certificates
    })
});

export default class Sonar {
    public static readonly channelNames = ["master", "game", "chatRender", "media", "aux", "chatCapture"];
    private static readonly streamerSliderNames = ["streaming", "monitoring"];
    private volumePath: string = "/volumeSettings/classic";
    private readonly appDataPath: string;
    private baseUrl!: string;
    private webServerAddress!: string;
    private streamerMode: boolean | undefined;

    constructor(appDataPath: string | null = null) {
        this.appDataPath = appDataPath ?? path.join(
            process.env["ProgramData"] ?? "",
            "SteelSeries",
            "SteelSeries Engine 3",
            "coreProps.json"
        );

        this.loadBaseUrl();
        this.init();
    }

    private async init(streamerMode: boolean | null = null): Promise<void> {
        await this.loadServerAddress();

        if (streamerMode === null) {
            this.streamerMode = await this.isStreamerMode();
        } else {
            this.streamerMode = streamerMode;
        }

        if (this.streamerMode) {
            this.volumePath = "/volumeSettings/streamer";
        }
    }

    private async isStreamerMode(): Promise<boolean> {
        const response = await axiosInstance.get(`${this.webServerAddress}/mode/`);
        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);
        
        return response.data === "stream";
    }

    async setStreamerMode(streamerMode: boolean): Promise<boolean> {
        const mode = streamerMode ? "stream" : "classic";
        const url = `${this.webServerAddress}/mode/${mode}`;
        const response = await axiosInstance.put(url);

        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);

        this.streamerMode = response.data === "stream";
        return this.streamerMode;
    }

    private loadBaseUrl(): void {
        if (!fs.existsSync(this.appDataPath)) throw new EnginePathNotFoundError();

        const data = fs.readFileSync(this.appDataPath, 'utf8');
        const commonAppData = JSON.parse(data);
        this.baseUrl = `https://${commonAppData.ggEncryptedAddress}`;
    }

    private async loadServerAddress(): Promise<void> {
        const response = await axiosInstance.get(`${this.baseUrl}/subApps`);

        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);

        const appDataJson = response.data as any;
        if (!appDataJson.subApps.sonar.isEnabled) throw new SonarNotEnabledError();
        if (!appDataJson.subApps.sonar.isReady) throw new ServerNotReadyError();
        if (!appDataJson.subApps.sonar.isRunning) throw new ServerNotRunningError();

        this.webServerAddress = appDataJson.subApps.sonar.metadata.webServerAddress;
        if (!this.webServerAddress) throw new WebServerAddressNotFoundError();
    }

    async getVolumeData(): Promise<any> {
        const response = await axiosInstance.get(`${this.webServerAddress}${this.volumePath}`);
        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);

        return response.data;
    }

    async setVolume(channel: string, volume: number, streamerSlider: string = "streaming"): Promise<any> {
        if (!Sonar.channelNames.includes(channel)) throw new ChannelNotFoundError(channel);
        if (this.streamerMode && !Sonar.streamerSliderNames.includes(streamerSlider)) throw new SliderNotFoundError(streamerSlider);
        if (volume < 0 || volume > 1) throw new InvalidVolumeError(volume);

        let fullVolumePath = this.volumePath;
        if (this.streamerMode) fullVolumePath += `/${streamerSlider}`;

        const url = `${this.webServerAddress}${fullVolumePath}/${channel}/Volume/${JSON.stringify(volume)}`;
        const response = await axiosInstance.put(url);

        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);
        return response.data;
    }

    async muteChannel(channel: string, muted: boolean, streamerSlider: string = "streaming"): Promise<any> {
        streamDeck.logger.info(`Muting channel ${channel} with muted: ${muted}`);

        if (!Sonar.channelNames.includes(channel)) throw new ChannelNotFoundError(channel);
        if (this.streamerMode && !Sonar.streamerSliderNames.includes(streamerSlider)) throw new SliderNotFoundError(streamerSlider);

        let fullVolumePath = this.volumePath;
        if (this.streamerMode) fullVolumePath += `/${streamerSlider}`;

        const muteKeyword = this.streamerMode ? "isMuted" : "Mute";
        const url = `${this.webServerAddress}${fullVolumePath}/${channel}/${muteKeyword}/${JSON.stringify(muted)}`;
        const response = await axiosInstance.put(url);

        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);
        return response.data;
    }

    async getChatMixData(): Promise<any> {
        const response = await axiosInstance.get(`${this.webServerAddress}/chatMix`);
        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);

        return response.data;
    }

    async setChatMix(mixVolume: number): Promise<any> {
        if (mixVolume < -1 || mixVolume > 1) throw new InvalidMixVolumeError(mixVolume);

        const url = `${this.webServerAddress}/chatMix?balance=${JSON.stringify(mixVolume)}`;
        const response = await axiosInstance.put(url);

        if (response.status !== 200) throw new ServerNotAccessibleError(response.status);
        return response.data;
    }
}