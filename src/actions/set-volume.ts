import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import sonar from "../sonar-controller";
import { VolumeData } from "../types/volume-data";

@action({ UUID: "com.stellar.steelseries-sonar-controls.set-volume" })
export class SetVolume extends SingletonAction<SetVolumeSettings> {
  private readonly sonarInstance = new sonar();

  override async onKeyDown(ev: KeyDownEvent<SetVolumeSettings>): Promise<void> {
    streamDeck.logger.info(
      `Set volume for channel: ${ev.payload.settings.selectedChannel}`
    );
    const channel = ev.payload.settings.selectedChannel;
    const response: VolumeData = await this.sonarInstance.getVolumeData();

    const volume = response.masters.classic.volume;

    const newVolume = normalizeVolume(volume, ev.payload.settings.stepSize, ev.payload.settings.increment);

    streamDeck.settings.setGlobalSettings({
        currentVolume: newVolume,
    });

    await this.sonarInstance.setVolume(channel, newVolume);
  }
}

function normalizeVolume(
  volume: number,
  stepSize: number,
  increment: boolean
): number {
  let newVolume = volume + stepSize / 100;
  if (!increment) {
    newVolume = volume - stepSize / 100;
  }
  if (newVolume > 1) {
    return 1;
  } else if (newVolume < 0) {
    return 0;
  } else {
    return newVolume;
  }
}

/**
 * Settings for {@link SetVolume}.
 */
type SetVolumeSettings = {
  selectedChannel: string;
  stepSize: number;
  increment: boolean;
  showVolume: boolean;
};

type GlobalSettings = {
    currentVolume: number;
};
