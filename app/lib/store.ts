import {create} from 'zustand';

interface AppState {
    dataUpdated: boolean;
    checkForUpdates: () => void;
    triggerUpdate: () => void;
    resetUpdate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    dataUpdated: false,
    checkForUpdates: () => {
        console.log("Checking for updates...");  // Placeholder for actual update logic
        // Optionally, add logic to actually fetch/check for new data
    },
    triggerUpdate: () => set({ dataUpdated: true }),
    resetUpdate: () => set({ dataUpdated: false }),
}));
