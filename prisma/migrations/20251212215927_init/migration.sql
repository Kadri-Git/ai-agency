-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "industry" TEXT,
    "logo_url" TEXT,
    "competitor_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_regions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "target_languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "share_of_voice" DOUBLE PRECISION NOT NULL,
    "sov_by_platform" JSONB NOT NULL,
    "visibility_score" DOUBLE PRECISION NOT NULL,
    "monthly_audience" INTEGER NOT NULL,
    "mention_count" INTEGER NOT NULL,
    "citation_count" INTEGER NOT NULL,
    "favorable_mentions" INTEGER NOT NULL,
    "neutral_mentions" INTEGER NOT NULL,
    "negative_mentions" INTEGER NOT NULL,
    "average_position" DOUBLE PRECISION NOT NULL,
    "total_fanout_queries" INTEGER NOT NULL,
    "avg_fanout_per_prompt" DOUBLE PRECISION NOT NULL,
    "common_added_terms" JSONB NOT NULL,
    "total_unique_sources" INTEGER NOT NULL,
    "source_diversity_score" DOUBLE PRECISION NOT NULL,
    "prompts_analyzed" INTEGER NOT NULL,
    "prompts_mentioned" INTEGER NOT NULL,
    "mention_rate" DOUBLE PRECISION NOT NULL,
    "competitive_rank" INTEGER,
    "competitors_analyzed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "config" JSONB NOT NULL DEFAULT '{}',
    "consistency_score" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "prompt_category" TEXT NOT NULL,
    "estimated_search_volume" INTEGER,
    "response" TEXT NOT NULL,
    "mentioned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,
    "context_snippet" TEXT,
    "sentiment" TEXT,
    "sentiment_score" DOUBLE PRECISION,
    "competitors_mentioned" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "competitor_positions" JSONB,
    "citations" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_narratives" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "brand_archetype" TEXT,
    "primary_narrative" TEXT,
    "secondary_narratives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recurring_themes" JSONB NOT NULL DEFAULT '[]',
    "key_associations" JSONB NOT NULL DEFAULT '{}',
    "positioning" TEXT,
    "overall_narrative_tone" TEXT,
    "consistency_score" DOUBLE PRECISION,
    "narrative_gaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "narrative_opportunities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_narratives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_opportunities" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "topic_category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "estimated_volume" INTEGER NOT NULL,
    "difficulty_score" DOUBLE PRECISION NOT NULL,
    "impact_score" DOUBLE PRECISION NOT NULL,
    "competitors_ranking" JSONB NOT NULL DEFAULT '[]',
    "market_leader" TEXT,
    "why_missing" TEXT,
    "content_gaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "citation_gaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommended_actions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_of_voice_history" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "overall_sov" DOUBLE PRECISION NOT NULL,
    "sov_by_platform" JSONB NOT NULL,
    "market_size" INTEGER NOT NULL,
    "your_mentions" INTEGER NOT NULL,
    "top_competitor" TEXT,
    "top_competitor_sov" DOUBLE PRECISION,
    "your_rank" INTEGER,
    "change_from_prev" DOUBLE PRECISION,
    "momentum" TEXT,
    "measured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_of_voice_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_fanouts" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "original_prompt" TEXT NOT NULL,
    "fanout_queries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "added_terms" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_fanouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_domain_key" ON "companies"("domain");

-- CreateIndex
CREATE INDEX "analyses_company_id_idx" ON "analyses"("company_id");

-- CreateIndex
CREATE INDEX "analyses_created_at_idx" ON "analyses"("created_at");

-- CreateIndex
CREATE INDEX "results_analysis_id_idx" ON "results"("analysis_id");

-- CreateIndex
CREATE INDEX "results_platform_idx" ON "results"("platform");

-- CreateIndex
CREATE INDEX "results_mentioned_idx" ON "results"("mentioned");

-- CreateIndex
CREATE INDEX "brand_narratives_company_id_idx" ON "brand_narratives"("company_id");

-- CreateIndex
CREATE INDEX "brand_narratives_analysis_id_idx" ON "brand_narratives"("analysis_id");

-- CreateIndex
CREATE INDEX "topic_opportunities_company_id_idx" ON "topic_opportunities"("company_id");

-- CreateIndex
CREATE INDEX "topic_opportunities_analysis_id_idx" ON "topic_opportunities"("analysis_id");

-- CreateIndex
CREATE INDEX "topic_opportunities_priority_idx" ON "topic_opportunities"("priority");

-- CreateIndex
CREATE INDEX "share_of_voice_history_company_id_idx" ON "share_of_voice_history"("company_id");

-- CreateIndex
CREATE INDEX "share_of_voice_history_measured_at_idx" ON "share_of_voice_history"("measured_at");

-- CreateIndex
CREATE INDEX "query_fanouts_analysis_id_idx" ON "query_fanouts"("analysis_id");

-- CreateIndex
CREATE INDEX "query_fanouts_result_id_idx" ON "query_fanouts"("result_id");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "results" ADD CONSTRAINT "results_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_narratives" ADD CONSTRAINT "brand_narratives_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_narratives" ADD CONSTRAINT "brand_narratives_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_opportunities" ADD CONSTRAINT "topic_opportunities_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_opportunities" ADD CONSTRAINT "topic_opportunities_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_of_voice_history" ADD CONSTRAINT "share_of_voice_history_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_fanouts" ADD CONSTRAINT "query_fanouts_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "query_fanouts" ADD CONSTRAINT "query_fanouts_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
