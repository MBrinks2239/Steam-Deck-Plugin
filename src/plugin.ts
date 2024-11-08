import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { MuteChannel } from "./actions/mute-channel";
import { SwitchOutput } from "./actions/switch-output";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the mute action.
streamDeck.actions.registerAction(new MuteChannel());
streamDeck.actions.registerAction(new SwitchOutput());

// Finally, connect to the Stream Deck.
streamDeck.connect();
