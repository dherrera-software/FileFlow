import { useTranslation } from '../../i18n/context'
import { cn } from '../../utils/cn'
import type { CommunityComment, FeedbackCategory } from '../../types/feedback'

interface CommentFeedHeaderProps {
  comments: CommunityComment[]
  selectedFilter: 'all' | FeedbackCategory
  onSelectFilter: (filter: 'all' | FeedbackCategory) => void
  visibleLimit: number
  onSelectLimit: (limit: number) => void
}

export function CommentFeedHeader({
  comments,
  selectedFilter,
  onSelectFilter,
  visibleLimit,
  onSelectLimit,
}: CommentFeedHeaderProps) {
  const { t } = useTranslation()

  const categoryLabels: Record<FeedbackCategory, string> = {
    suggestion: t('feedback.filterSuggestions') || 'Sugerencia',
    general: t('feedback.filterGeneral') || 'General',
    desktop: t('feedback.filterDesktop') || 'Desktop',
    bug: t('feedback.filterBugs') || 'Problema',
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(['all', 'general', 'suggestion', 'desktop', 'bug'] as const).map((filter) => {
          const count =
            filter === 'all'
              ? comments.length
              : comments.filter((c) => c.category === filter).length
          const label =
            filter === 'all'
              ? t('feedback.filterAll') || 'Todos'
              : categoryLabels[filter]

          return (
            <button
              key={filter}
              type="button"
              onClick={() => onSelectFilter(filter)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                selectedFilter === filter
                  ? 'border border-accent-line bg-accent text-accent-on'
                  : 'border border-line bg-surface-raised text-ink-subtle hover:border-line-strong hover:text-ink',
              )}
            >
              <span>{label}</span>
              <span className="font-mono text-[9.5px] opacity-75">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Selector de cantidad a mostrar */}
      <div className="flex items-center gap-1.5 text-[11.5px] text-ink-subtle">
        <span>Mostrar:</span>
        {[5, 10, 20, 50].map((qty) => (
          <button
            key={qty}
            type="button"
            onClick={() => onSelectLimit(qty)}
            className={cn(
              'rounded-md px-2 py-0.5 font-mono text-[11px] font-medium transition-colors',
              visibleLimit === qty
                ? 'bg-accent text-accent-on'
                : 'border border-line bg-surface text-ink-subtle hover:text-ink',
            )}
          >
            {qty}
          </button>
        ))}
      </div>
    </div>
  )
}
