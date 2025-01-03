import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { MuteChannel } from "./actions/mute-channel";
import { SwitchOutput } from "./actions/switch-output";
import { SetVolume } from "./actions/set-volume";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions.
streamDeck.actions.registerAction(new MuteChannel());
streamDeck.actions.registerAction(new SwitchOutput());
streamDeck.actions.registerAction(new SetVolume());

// Finally, connect to the Stream Deck.
streamDeck.connect();
