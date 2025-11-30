<script lang="ts">
	import { onMount } from 'svelte';
	import type { AIAnalysisResult, Suggestion } from '$lib/services/aiService';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { AlertCircle, CheckCircle, Zap, TrendingUp, Eye, Wrench, Award } from 'lucide-svelte';

	export let analysis: AIAnalysisResult | null = null;
	export let isLoading = false;
	export let onRetry: (() => void) | null = null;

	function getSeverityColor(severity: 'low' | 'medium' | 'high'): string {
		switch (severity) {
			case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
			case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
			default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
		}
	}

	function getTypeIcon(type: string) {
		switch (type) {
			case 'error': return AlertCircle;
			case 'warning': return AlertCircle;
			case 'improvement': return TrendingUp;
			case 'optimization': return Zap;
			default: return CheckCircle;
		}
	}

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-emerald-400';
		if (score >= 60) return 'text-amber-400';
		return 'text-red-400';
	}

	function getQualityBarColor(value: number): string {
		if (value >= 80) return 'bg-emerald-500';
		if (value >= 60) return 'bg-amber-500';
		return 'bg-red-500';
	}
</script>

{#if isLoading}
	<Card class="bg-neutral-900 border-neutral-800">
		<CardContent class="p-4">
			<div class="flex items-center gap-3">
				<div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
				<span class="text-sm text-neutral-400">Analyzing code with AI...</span>
			</div>
		</CardContent>
	</Card>
{:else if analysis}
	<div class="space-y-4">
		<!-- Overall Score -->
		<Card class="bg-neutral-900 border-neutral-800">
			<CardHeader class="pb-3">
				<div class="flex items-center justify-between">
					<div>
						<CardTitle class="flex items-center gap-2">
							<Award class="w-5 h-5 text-amber-400" />
							Code Analysis
						</CardTitle>
						<CardDescription>AI-powered code quality assessment</CardDescription>
					</div>
					<div class="text-right">
						<div class="text-2xl font-bold {getScoreColor(analysis.score)}">{analysis.score}/100</div>
						<div class="text-xs text-neutral-400">Overall Score</div>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-neutral-300 mb-4">{analysis.summary}</p>
				
				<!-- Quality Metrics -->
				<div class="grid grid-cols-2 gap-3">
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Eye class="w-3 h-3 text-neutral-400" />
								<span class="text-xs text-neutral-400">Readability</span>
							</div>
							<span class="text-xs {getScoreColor(analysis.codeQuality.readability)}">{analysis.codeQuality.readability}%</span>
						</div>
						<div class="w-full bg-neutral-700 rounded-full h-1.5">
							<div class="{getQualityBarColor(analysis.codeQuality.readability)} h-1.5 rounded-full" style="width: {analysis.codeQuality.readability}%"></div>
						</div>
					</div>
					
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Zap class="w-3 h-3 text-neutral-400" />
								<span class="text-xs text-neutral-400">Performance</span>
							</div>
							<span class="text-xs {getScoreColor(analysis.codeQuality.performance)}">{analysis.codeQuality.performance}%</span>
						</div>
						<div class="w-full bg-neutral-700 rounded-full h-1.5">
							<div class="{getQualityBarColor(analysis.codeQuality.performance)} h-1.5 rounded-full" style="width: {analysis.codeQuality.performance}%"></div>
						</div>
					</div>
					
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Wrench class="w-3 h-3 text-neutral-400" />
								<span class="text-xs text-neutral-400">Maintainability</span>
							</div>
							<span class="text-xs {getScoreColor(analysis.codeQuality.maintainability)}">{analysis.codeQuality.maintainability}%</span>
						</div>
						<div class="w-full bg-neutral-700 rounded-full h-1.5">
							<div class="{getQualityBarColor(analysis.codeQuality.maintainability)} h-1.5 rounded-full" style="width: {analysis.codeQuality.maintainability}%"></div>
						</div>
					</div>
					
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<CheckCircle class="w-3 h-3 text-neutral-400" />
								<span class="text-xs text-neutral-400">Best Practices</span>
							</div>
							<span class="text-xs {getScoreColor(analysis.codeQuality.bestPractices)}">{analysis.codeQuality.bestPractices}%</span>
						</div>
						<div class="w-full bg-neutral-700 rounded-full h-1.5">
							<div class="{getQualityBarColor(analysis.codeQuality.bestPractices)} h-1.5 rounded-full" style="width: {analysis.codeQuality.bestPractices}%"></div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Suggestions -->
		{#if analysis.suggestions.length > 0}
			<Card class="bg-neutral-900 border-neutral-800">
				<CardHeader>
					<CardTitle class="text-base">Improvement Suggestions</CardTitle>
					<CardDescription>{analysis.suggestions.length} suggestions found</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						{#each analysis.suggestions as suggestion}
							<div class="flex gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
								<div class="flex-shrink-0 mt-0.5">
									<svelte:component this={getTypeIcon(suggestion.type)} class="w-4 h-4 text-neutral-400" />
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<p class="text-sm font-medium text-neutral-200">{suggestion.message}</p>
										<Badge class="{getSeverityColor(suggestion.severity)} text-xs">
											{suggestion.severity}
										</Badge>
									</div>
									{#if suggestion.description}
										<p class="text-xs text-neutral-400">{suggestion.description}</p>
									{/if}
									{#if suggestion.line}
										<p class="text-xs text-neutral-500 mt-1">Line {suggestion.line}</p>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card class="bg-neutral-900 border-neutral-800">
				<CardContent class="p-4">
					<div class="flex items-center gap-3">
						<CheckCircle class="w-5 h-5 text-emerald-400" />
						<div>
							<p class="text-sm font-medium text-neutral-200">Great code!</p>
							<p class="text-xs text-neutral-400">No immediate suggestions found.</p>
						</div>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
{:else}
	<Card class="bg-neutral-900 border-neutral-800">
		<CardContent class="p-4">
			<div class="text-center">
				<p class="text-sm text-neutral-400 mb-3">Run your code to get AI-powered feedback</p>
				{#if onRetry}
					<Button onclick={onRetry} size="sm" variant="outline">
						Analyze Code
					</Button>
				{/if}
			</div>
		</CardContent>
	</Card>
{/if}