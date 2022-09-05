package com.kyonggi.hearing.presentation.di

import android.content.Context
import com.kyonggi.hearing.data.repository.DataStoreRepositoryImpl
import com.kyonggi.hearing.domain.repository.DataStoreRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Singleton
    @Provides
    fun providesDataStoreRepository(
        @ApplicationContext context: Context
    ): DataStoreRepository = DataStoreRepositoryImpl(context)
}