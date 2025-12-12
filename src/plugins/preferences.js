// preferences.js
export const preferences = {
    // Get all preferences
    async getAll() {
        const response = await fetch('/users/me/preferences');
        const data = await response.json();
        return data.preferences || {};
    },

    // Get specific section
    async getSection(rootUrl, section) {
        try {
            const response = await fetch(rootUrl + `/users/me/preferences/${section}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                return data.preferences || {};
            }
        } catch (error) {
            console.error('Error fetching current user preferences:', error);
        }
    },

    // Update entire preferences
    async updateAll(newPreferences) {
        await fetch('/users/me/preferences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preferences: newPreferences })
        });
    },

    // Update specific section
    async updateSection(rootUrl, section, sectionPreferences) {
        try {
            const response = await fetch(rootUrl + `/users/me/preferences/${section}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: sectionPreferences })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update preferences\' section');
            } else {
                return response;
            }
        } catch (error) {
            console.error("Error while updating preferences :", error);
            throw error;
        }
    }
}