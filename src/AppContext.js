// =============================================================================
// AppContext.js
// PURPOSE: Creates and exports the React Context "channel."
// The actual state lives in App.jsx. This file just creates the empty vessel.
// Any component can import this and call useContext(AppContext) to access
// the global state without prop drilling.
// =============================================================================
import { createContext } from 'react';

const AppContext = createContext(null);

export default AppContext;