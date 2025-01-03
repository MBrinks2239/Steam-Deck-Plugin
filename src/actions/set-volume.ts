import streamDeck, {
  action,
  DialAction,
  DidReceiveSettingsEvent,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
} from "@elgato/streamdeck";
import sonar from "../managers/sonar-controller";
import { VolumeData } from "../types/volume-data";

@action({ UUID: "com.stellar.steelseries-sonar-controls.set-volume" })
export class SetVolume extends SingletonAction<SetVolumeSettings> {
  private readonly sonarInstance = new sonar();

  override async onKeyDown(ev: KeyDownEvent<SetVolumeSettings>): Promise<void> {
    streamDeck.logger.info(
      `Set volume for channel: ${ev.payload.settings.selectedChannel}`
    );
    const channel = ev.payload.settings.selectedChannel;
    const response = await this.sonarInstance.getVolumeData();

    const volume = response.masters.classic.volume;

    const newVolume = normalizeVolume(
      volume,
      ev.payload.settings.stepSize,
      ev.payload.settings.increment
    );

    this.actions.forEach((action) => {
      checkForSetTitle(action, newVolume * 100);
    });

    await this.sonarInstance.setVolume(channel, newVolume);
  }

  // override async onDidReceiveSettings(
  //   ev: DidReceiveSettingsEvent<SetVolumeSettings>
  // ): Promise<void> {
  //   if (ev.payload.settings.showVolume) {
  //     const volumeData = await this.sonarInstance.getVolumeData();
  //     const volume = volumeData.masters.classic.volume * 100;
  //     ev.action.setTitle(volume.toString() + "%");
  //   } else {
  //     ev.action.setTitle("");
  //   }
  // }
}

async function checkForSetTitle(
  action: KeyAction<SetVolumeSettings> | DialAction<SetVolumeSettings>,
  volume: number
) {
  const settings = await action.getSettings();
  if (settings.showVolume) {
    await action.setTitle(volume.toString() + "%");
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
