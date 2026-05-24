package com.axomprahari.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        val HAS_COMPLETED_ONBOARDING = booleanPreferencesKey("has_completed_onboarding")
        val USER_TOKEN = stringPreferencesKey("user_token")
    }

    val hasCompletedOnboarding: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[HAS_COMPLETED_ONBOARDING] ?: false
        }

    val userToken: Flow<String?> = context.dataStore.data
        .map { preferences ->
            preferences[USER_TOKEN]
        }

    suspend fun setCompletedOnboarding(completed: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[HAS_COMPLETED_ONBOARDING] = completed
        }
    }

    suspend fun saveUserToken(token: String?) {
        context.dataStore.edit { preferences ->
            if (token == null) {
                preferences.remove(USER_TOKEN)
            } else {
                preferences[USER_TOKEN] = token
            }
        }
    }

    suspend fun clear() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
