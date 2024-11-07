import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { SonarControls } from "./actions/sonar-controls";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register the mute action.
streamDeck.actions.registerAction(new SonarControls());

// Finally, connect to the Stream Deck.
streamDeck.connect();
