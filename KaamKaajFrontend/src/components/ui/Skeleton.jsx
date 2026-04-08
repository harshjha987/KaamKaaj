import React from 'react'

// Reusable skeleton block — mimics content shape while loading.
// Uses the .skeleton CSS class from globals.css for the shimmer effect.
export function SkeletonBlock({ width = '100%', height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  )
}

// Pre-built skeleton for a task card
export function TaskCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
      padding: '0.85rem', marginBottom: '0.5rem',
      border: '1px solid var(--border)',
    }}>
      <SkeletonBlock height={14} width="75%" style={{ marginBottom: '0.6rem' }} />
      <SkeletonBlock height={10} width="45%" style={{ marginBottom: '0.75rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBlock height={20} width={60} borderRadius={99} />
        <SkeletonBlock height={20} width={20} borderRadius={99} />
      </div>
    </div>
  )
}

// Pre-built skeleton for a workspace card
export function WorkspaceCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg3)', borderRadius: 'var(--radius-lg)',
      padding: '1.25rem', border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <SkeletonBlock width={40} height={40} borderRadius={8} />
        <div style={{ flex: 1 }}>
          <SkeletonBlock height={14} width="60%" style={{ marginBottom: '0.4rem' }} />
          <SkeletonBlock height={10} width="40%" />
        </div>
      </div>
      <SkeletonBlock height={10} width="80%" style={{ marginBottom: '0.3rem' }} />
      <SkeletonBlock height={10} width="55%" />
    </div>
  )
}

// Pre-built skeleton for an inbox item
export function InboxItemSkeleton() {
  return (
    <div style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
      <SkeletonBlock height={10} width={70} borderRadius={99} style={{ marginBottom: '0.4rem' }} />
      <SkeletonBlock height={13} width="65%" style={{ marginBottom: '0.25rem' }} />
      <SkeletonBlock height={10} width="40%" style={{ marginBottom: '0.5rem' }} />
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <SkeletonBlock width={60} height={26} />
        <SkeletonBlock width={60} height={26} />
      </div>
    </div>
  )
}

// Pre-built skeleton for a metric card
export function MetricCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1.25rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <SkeletonBlock height={12} width={80} />
        <SkeletonBlock height={14} width={14} borderRadius={99} />
      </div>
      <SkeletonBlock height={36} width={60} style={{ marginBottom: '0.4rem' }} />
      <SkeletonBlock height={10} width="70%" />
    </div>
  )
}

// Pre-built skeleton for a list item (tasks, members etc)
export function ListItemSkeleton() {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '1rem 1.25rem',
      marginBottom: '0.75rem',
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <SkeletonBlock width={32} height={32} borderRadius={99} />
        <div style={{ flex: 1 }}>
          <SkeletonBlock height={13} width="50%" style={{ marginBottom: '0.35rem' }} />
          <SkeletonBlock height={10} width="35%" />
        </div>
        <SkeletonBlock width={70} height={26} borderRadius={99} />
      </div>
    </div>
  )
}