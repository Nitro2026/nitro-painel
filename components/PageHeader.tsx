'use client'

import React from 'react'

interface PageHeaderProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-8 anim-up">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          {icon}
        </div>
        <div>
          <h1 className="text-lg font-semibold leading-none" style={{ color: 'var(--text)' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
