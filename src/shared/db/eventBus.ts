import EventEmitter from "eventemitter3"
import { CarPoolEventTypes } from "./events";


// EXTEND FOR TYPE SAFETY
class CarpoolEventEmitter extends EventEmitter<CarPoolEventTypes> {}

// Create the single instance (Singleton)
const eventBus = new CarpoolEventEmitter();

export default eventBus;