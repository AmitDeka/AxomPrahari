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
        val CACHED_USER_PROFILE = stringPreferencesKey("cached_user_profile")
        val CACHED_REPORT_STATS = stringPreferencesKey("cached_report_stats")
        val CACHED_REPORTS_LIST = stringPreferencesKey("cached_reports_list")
    }

    val hasCompletedOnboarding: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[HAS_COMPLETED_ONBOARDING] ?: false
        }

    val userToken: Flow<String?> = context.dataStore.data
        .map { preferences ->
            preferences[USER_TOKEN]
        }

    val cachedUserProfile: Flow<String?> = context.dataStore.data.map { it[CACHED_USER_PROFILE] }
    val cachedReportStats: Flow<String?> = context.dataStore.data.map { it[CACHED_REPORT_STATS] }
    val cachedReportsList: Flow<String?> = context.dataStore.data.map { it[CACHED_REPORTS_LIST] }

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

    suspend fun saveCachedUserProfile(json: String?) {
        context.dataStore.edit { if (json == null) it.remove(CACHED_USER_PROFILE) else it[CACHED_USER_PROFILE] = json }
    }

    suspend fun saveCachedReportStats(json: String?) {
        context.dataStore.edit { if (json == null) it.remove(CACHED_REPORT_STATS) else it[CACHED_REPORT_STATS] = json }
    }

    suspend fun saveCachedReportsList(json: String?) {
        context.dataStore.edit { if (json == null) it.remove(CACHED_REPORTS_LIST) else it[CACHED_REPORTS_LIST] = json }
    }

    suspend fun clear() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
}
