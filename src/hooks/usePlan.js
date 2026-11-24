import { useCallback, useEffect, useMemo } from 'react'
import { useStored, KEYS } from './useStored'
import { PLAN_BY_ID, TRIAL_DAYS } from '../data/plans'

const DAY = 24 * 60 * 60 * 1000

/**
 * Plano da pessoa neste aparelho (tudo simulado, nada é cobrado).
 * - null: Gratuito
 * - { plan, summary, at }: assinatura simulada
 * - { plan, trial: true, at, endsAt }: teste grátis de 7 dias, que termina sozinho
 */
export function usePlan({ onTrialEnded } = {}) {
  const [stored, setStored] = useStored(KEYS.plan, null)
  const [trialUsed, setTrialUsed] = useStored(KEYS.trialUsed, false)

  const expired = Boolean(stored?.trial && stored.endsAt <= Date.now())

  // Teste vencido volta para o Gratuito
  useEffect(() => {
    if (expired) {
      setStored(null)
      onTrialEnded?.()
    }
  }, [expired, setStored, onTrialEnded])

  const plan = expired ? null : stored
  const daysLeft = plan?.trial ? Math.max(1, Math.ceil((plan.endsAt - Date.now()) / DAY)) : null

  const startTrial = useCallback(
    (planId) => {
      const now = Date.now()
      setStored({ plan: planId, trial: true, at: now, endsAt: now + TRIAL_DAYS * DAY, summary: `Teste grátis de ${TRIAL_DAYS} dias` })
      setTrialUsed(true)
    },
    [setStored, setTrialUsed]
  )

  const subscribe = useCallback((sub) => setStored(sub), [setStored])
  const cancel = useCallback(() => setStored(null), [setStored])

  return useMemo(
    () => ({
      plan,
      planName: plan ? PLAN_BY_ID[plan.plan].name : 'Gratuito',
      isPremium: Boolean(plan),
      isTrial: Boolean(plan?.trial),
      daysLeft,
      canTrial: !trialUsed && !plan,
      startTrial,
      subscribe,
      cancel,
    }),
    [plan, daysLeft, trialUsed, startTrial, subscribe, cancel]
  )
}
