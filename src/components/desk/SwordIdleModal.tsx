import { useState, useCallback, useRef, useEffect } from 'react'
import swordEnemiesData from '../../data/swordEnemies.json'

const SWORD_BASE_CRIT_CHANCE = 0
const SWORD_IDLE_TICK_MS = 1000
const SWORD_POTION_HEAL = 18
const SWORD_TNT_BASE_COST = 1000
const SWORD_TNT_DAMAGE_MULTIPLIER = 1000

interface SwordBoss {
  name: string
  hp: number
}

interface DamageFloat {
  id: number
  amount: number
  crit: boolean
}

type SwordUpgradeKey = 'click' | 'dps' | 'crit' | 'goldps' | 'loot' | 'hp' | 'armor' | 'regen' | 'totem' | 'minecart'

const SWORD_BOSS_POOL: SwordBoss[] = (swordEnemiesData as SwordBoss[]).length > 0
  ? (swordEnemiesData as SwordBoss[])
  : [{ name: 'Zombie', hp: 30 }]

export default function SwordIdleModal({ onClose, onSwordHit }: { onClose: () => void; onSwordHit: () => void }) {
  const [bossIndex, setBossIndex] = useState(0)
  const [bossHp, setBossHp] = useState(SWORD_BOSS_POOL[0].hp)
  const [maxHp, setMaxHp] = useState(SWORD_BOSS_POOL[0].hp)
  const [gold, setGold] = useState(0)
  const [clickDamage, setClickDamage] = useState(1)
  const [dps, setDps] = useState(0)
  const [critChance, setCritChance] = useState(SWORD_BASE_CRIT_CHANCE)
  const [oreChance, setOreChance] = useState(0.03)
  const [goldPerSecond, setGoldPerSecond] = useState(0)
  const [lootBonus, setLootBonus] = useState(1)
  const [playerMaxHp, setPlayerMaxHp] = useState(24)
  const [playerHp, setPlayerHp] = useState(24)
  const [armor, setArmor] = useState(0)
  const [hpRegen, setHpRegen] = useState(0)
  const [enemyDamage, setEnemyDamage] = useState(1)
  const [deaths, setDeaths] = useState(0)
  const [totems, setTotems] = useState(0)
  const [potions, setPotions] = useState(0)
  const [tntMinecarts, setTntMinecarts] = useState(0)
  const [shopLevelClick, setShopLevelClick] = useState(0)
  const [shopLevelDps, setShopLevelDps] = useState(0)
  const [shopLevelCrit, setShopLevelCrit] = useState(0)
  const [shopLevelOre, setShopLevelOre] = useState(0)
  const [shopLevelGoldps, setShopLevelGoldps] = useState(0)
  const [shopLevelLoot, setShopLevelLoot] = useState(0)
  const [shopLevelHp, setShopLevelHp] = useState(0)
  const [shopLevelArmor, setShopLevelArmor] = useState(0)
  const [shopLevelRegen, setShopLevelRegen] = useState(0)
  const [shopLevelTotem, setShopLevelTotem] = useState(0)
  const [shopLevelMinecart, setShopLevelMinecart] = useState(0)
  const [combo, setCombo] = useState(0)
  const [victory, setVictory] = useState(false)
  const [statusText, setStatusText] = useState('Hunt mobs and build your gear.')
  const [floats, setFloats] = useState<DamageFloat[]>([])
  const floatIdRef = useRef(0)
  const bossClearLockRef = useRef(false)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentBoss = SWORD_BOSS_POOL[bossIndex]
  const kills = bossIndex + (victory ? 1 : 0)
  const hpPct = Math.max(0, Math.min(100, (bossHp / maxHp) * 100))
  const playerHpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))
  const progressPct = Math.round((bossIndex / (SWORD_BOSS_POOL.length - 1)) * 100)
  const enemyAttackMs = Math.max(1000, 2200 - bossIndex * 5)
  const potionCost = Math.ceil(8 + playerMaxHp * 0.14)
  const potionHeal = SWORD_POTION_HEAL
  const armorReductionPct = Math.min(72, armor * 4.5)

  const costs: Record<SwordUpgradeKey | 'ore', number> = {
    click: Math.ceil(9 * (1.42 ** shopLevelClick)),
    dps: Math.ceil(20 * (1.6 ** shopLevelDps)),
    crit: Math.ceil(16 * (1.54 ** shopLevelCrit)),
    ore: Math.ceil(18 * (1.5 ** shopLevelOre)),
    goldps: Math.ceil(22 * (1.62 ** shopLevelGoldps)),
    loot: Math.ceil(26 * (1.58 ** shopLevelLoot)),
    hp: Math.ceil(18 * (1.55 ** shopLevelHp)),
    armor: Math.ceil(16 * (1.52 ** shopLevelArmor)),
    regen: Math.ceil(26 * (1.68 ** shopLevelRegen)),
    totem: Math.ceil(34 * (1.7 ** shopLevelTotem)),
    minecart: Math.ceil(SWORD_TNT_BASE_COST * (1.92 ** shopLevelMinecart)),
  }

  const queueStatus = useCallback((text: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setStatusText(text)
    statusTimerRef.current = setTimeout(() => {
      setStatusText(victory ? 'You cleared every boss. GG.' : 'Hunt mobs and build your gear.')
      statusTimerRef.current = null
    }, 1200)
  }, [victory])

  const spawnNextBoss = useCallback(() => {
    const isLastBoss = bossIndex >= SWORD_BOSS_POOL.length - 1
    const nextKills = bossIndex + 1
    const reward = Math.round((6 + maxHp * 0.085) * lootBonus)
    setGold((prev) => prev + reward)
    setCombo((prev) => prev + 1)
    setPlayerHp((prev) => Math.min(playerMaxHp, prev + Math.ceil(playerMaxHp * 0.12)))
    if (nextKills % 5 === 0) {
      const chest = Math.round(22 * lootBonus)
      setGold((prev) => prev + chest)
      queueStatus(`Loot chest found: +${chest} gold`)
    } else {
      queueStatus(`Target down: +${reward} gold`)
    }
    if (isLastBoss) {
      setVictory(true)
      return
    }
    setBossIndex((prev) => prev + 1)
  }, [bossIndex, lootBonus, maxHp, playerMaxHp, queueStatus])

  useEffect(() => {
    if (victory) return
    const boss = SWORD_BOSS_POOL[bossIndex]
    const exponentialScale = 1.07 ** bossIndex
    const nextHp = Math.max(1, Math.round(boss.hp * exponentialScale))
    const nextEnemyDamage = Math.max(1, Math.round(1 + bossIndex * 0.18 + nextHp * 0.0018))
    setMaxHp(nextHp)
    setBossHp(nextHp)
    setEnemyDamage(nextEnemyDamage)
  }, [bossIndex, victory])

  const dealDamage = useCallback((base: number, crit: boolean) => {
    if (victory || base <= 0) return
    const amount = crit ? Math.ceil(base * 1.5) : base
    const id = floatIdRef.current++
    setFloats((prev) => [...prev, { id, amount, crit }].slice(-10))
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== id))
    }, 700)
    setBossHp((prev) => Math.max(0, prev - amount))
  }, [victory])

  useEffect(() => {
    if (victory || bossHp > 0) return
    if (bossClearLockRef.current) return
    bossClearLockRef.current = true
    spawnNextBoss()
  }, [bossHp, spawnNextBoss, victory])

  useEffect(() => {
    if (bossHp > 0) {
      bossClearLockRef.current = false
    }
  }, [bossHp])

  const handleHit = useCallback(() => {
    if (victory) return
    onSwordHit()
    const crit = Math.random() < critChance
    const hitDamage = crit ? Math.ceil(clickDamage * 1.5) : clickDamage
    dealDamage(clickDamage, crit)
    if (Math.random() < oreChance) {
      setGold((prev) => prev + hitDamage)
      queueStatus(`Lucky drop: +${hitDamage} gold`)
    }
  }, [clickDamage, critChance, dealDamage, onSwordHit, oreChance, queueStatus, victory])

  const buyUpgrade = useCallback((kind: SwordUpgradeKey | 'ore') => {
    if (victory) return
    const cost = costs[kind]
    if (gold < cost) return
    setGold((prev) => prev - cost)
    if (kind === 'click') {
      setClickDamage((prev) => prev + 1)
      setShopLevelClick((prev) => prev + 1)
      queueStatus('Click damage increased')
      return
    }
    if (kind === 'dps') {
      setDps((prev) => prev + 3)
      setShopLevelDps((prev) => prev + 1)
      queueStatus('Passive damage increased by 3')
      return
    }
    if (kind === 'crit') {
      setCritChance((prev) => Math.min(0.75, prev + 0.02))
      setShopLevelCrit((prev) => prev + 1)
      queueStatus('Critical chance increased')
      return
    }
    if (kind === 'goldps') {
      setGoldPerSecond((prev) => prev + 3)
      setShopLevelGoldps((prev) => prev + 1)
      queueStatus('Passive gold increased by 3')
      return
    }
    if (kind === 'loot') {
      setLootBonus((prev) => prev + 0.08)
      setShopLevelLoot((prev) => prev + 1)
      queueStatus('Loot multiplier increased')
      return
    }
    if (kind === 'hp') {
      setPlayerMaxHp((prev) => prev + 8)
      setPlayerHp((prev) => prev + 8)
      setShopLevelHp((prev) => prev + 1)
      queueStatus('Max HP increased')
      return
    }
    if (kind === 'armor') {
      setArmor((prev) => prev + 1)
      setShopLevelArmor((prev) => prev + 1)
      queueStatus('Armor increased')
      return
    }
    if (kind === 'regen') {
      setHpRegen((prev) => prev + 1)
      setShopLevelRegen((prev) => prev + 1)
      queueStatus('HP regen increased')
      return
    }
    if (kind === 'totem') {
      setTotems((prev) => prev + 1)
      setShopLevelTotem((prev) => prev + 1)
      queueStatus('Totem of Undying acquired')
      return
    }
    if (kind === 'minecart') {
      setTntMinecarts((prev) => prev + 1)
      setShopLevelMinecart((prev) => prev + 1)
      queueStatus('TNT Minecart added to inventory')
      return
    }
    setOreChance((prev) => Math.min(0.55, prev + 0.03))
    setShopLevelOre((prev) => prev + 1)
    queueStatus('Lucky drop chance increased')
  }, [costs, gold, queueStatus, victory])

  const handlePotion = useCallback(() => {
    if (victory || potions <= 0 || playerHp >= playerMaxHp) return
    setPotions((prev) => prev - 1)
    setPlayerHp((prev) => Math.min(playerMaxHp, prev + potionHeal))
    queueStatus(`Potion used: +${potionHeal} HP`)
  }, [playerHp, playerMaxHp, potionHeal, potions, queueStatus, victory])

  const handleBuyPotion = useCallback(() => {
    if (victory || gold < potionCost) return
    setGold((prev) => prev - potionCost)
    setPotions((prev) => prev + 1)
    queueStatus('Potion added to inventory')
  }, [gold, potionCost, queueStatus, victory])

  const handleTntMinecart = useCallback(() => {
    if (victory || tntMinecarts <= 0) return
    const minecartDamage = Math.max(Math.ceil(maxHp * 0.24), clickDamage * SWORD_TNT_DAMAGE_MULTIPLIER)
    setTntMinecarts((prev) => prev - 1)
    dealDamage(minecartDamage, false)
    queueStatus(`TNT Minecart detonated: -${minecartDamage} HP`)
  }, [clickDamage, dealDamage, maxHp, queueStatus, tntMinecarts, victory])

  useEffect(() => {
    if (victory || dps <= 0) return
    const timer = setInterval(() => {
      dealDamage(dps, false)
    }, SWORD_IDLE_TICK_MS)
    return () => clearInterval(timer)
  }, [dealDamage, dps, victory])

  useEffect(() => {
    if (victory || goldPerSecond <= 0) return
    const timer = setInterval(() => {
      setGold((prev) => prev + goldPerSecond)
    }, SWORD_IDLE_TICK_MS)
    return () => clearInterval(timer)
  }, [goldPerSecond, victory])

  useEffect(() => {
    if (victory || hpRegen <= 0) return
    const timer = setInterval(() => {
      setPlayerHp((prev) => Math.min(playerMaxHp, prev + hpRegen))
    }, SWORD_IDLE_TICK_MS)
    return () => clearInterval(timer)
  }, [hpRegen, playerMaxHp, victory])

  useEffect(() => {
    if (victory) return
    const timer = setInterval(() => {
      const reduction = Math.min(0.72, armor * 0.045)
      const taken = Math.max(1, Math.ceil(enemyDamage * (1 - reduction)))
      setPlayerHp((prev) => {
        const next = prev - taken
        if (next <= 0) {
          if (totems > 0) {
            setTotems((t) => t - 1)
            queueStatus('Totem triggered: death avoided')
            return Math.ceil(playerMaxHp * 0.65)
          }
          setDeaths((d) => d + 1)
          setCombo(0)
          setGold((g) => Math.max(0, g - Math.ceil(g * 0.1)))
          setBossHp(maxHp)
          queueStatus('You were defeated. Current target reset.')
          return playerMaxHp
        }
        return next
      })
    }, enemyAttackMs)
    return () => clearInterval(timer)
  }, [armor, enemyAttackMs, enemyDamage, maxHp, playerMaxHp, queueStatus, totems, victory])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    }
  }, [])

  return (
    <div className="sword-idle-modal-backdrop" onClick={onClose}>
      <div
        className="sword-idle-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Sword boss simulator"
      >
        <div className="sword-idle-modal-header">
          <div className="sword-idle-title-wrap">
            <p className="sword-idle-title">BOSS FIGHT SIM</p>
            <p className="sword-idle-subtitle">Minecraft sword training</p>
          </div>
          <button type="button" className="sword-idle-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="sword-idle-top-grid">
          <div className="sword-idle-info-card">
            <p className="sword-idle-info-title">Run</p>
            <div className="sword-idle-kv-grid">
              <span>Kills</span><span>{kills}</span>
              <span>Gold</span><span>{gold}</span>
              <span>Combo</span><span>{combo}</span>
              <span>Deaths</span><span>{deaths}</span>
            </div>
          </div>
          <div className="sword-idle-info-card">
            <p className="sword-idle-info-title">Inventory</p>
            <div className="sword-idle-kv-grid">
              <span>Potions</span><span>{potions}</span>
              <span>Totems</span><span>{totems}</span>
              <span>Minecarts</span><span>{tntMinecarts}</span>
              <span>Atk Speed</span><span>{(1000 / enemyAttackMs).toFixed(2)}/s</span>
            </div>
          </div>
        </div>

        <div className="sword-idle-run-progress">
          <span>Run progress</span>
          <span>{progressPct}%</span>
          <span>{bossIndex + 1}/{SWORD_BOSS_POOL.length}</span>
        </div>
        <div className="sword-idle-run-bar">
          <span className="sword-idle-run-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="sword-idle-boss-panel">
          <div className="sword-idle-boss-row">
            <span className="sword-idle-boss-name">{currentBoss.name}</span>
            <span className="sword-idle-boss-hp">{bossHp} / {maxHp} | DMG {enemyDamage}</span>
          </div>
          <p className="sword-idle-bar-label sword-idle-bar-label--enemy">Enemy HP</p>
          <div className="sword-idle-boss-bar">
            <span className="sword-idle-boss-fill" style={{ width: `${hpPct}%` }} />
          </div>
          <p className="sword-idle-bar-label sword-idle-bar-label--player">Your HP</p>
          <div className="sword-idle-boss-row sword-idle-boss-row--player">
            <span>Current</span>
            <span className="sword-idle-boss-hp">{playerHp} / {playerMaxHp}</span>
          </div>
          <div className="sword-idle-boss-bar sword-idle-boss-bar--player">
            <span className="sword-idle-boss-fill sword-idle-boss-fill--player" style={{ width: `${playerHpPct}%` }} />
          </div>
          <div className="sword-idle-float-layer" aria-hidden="true">
            {floats.map((f) => (
              <span key={f.id} className={`sword-idle-float${f.crit ? ' sword-idle-float--crit' : ''}`}>
                -{f.amount}{f.crit ? ' CRIT!' : ''}
              </span>
            ))}
          </div>
        </div>

        <div className="sword-idle-actions">
          <div className="sword-idle-actions-row">
            <button type="button" className="sword-idle-hit-btn" onClick={handleHit} disabled={victory}>
              {victory ? 'VICTORY' : 'HIT BOSS'}
            </button>
            <button type="button" className="sword-idle-hit-btn sword-idle-hit-btn--alt" onClick={handlePotion} disabled={victory || potions <= 0 || playerHp >= playerMaxHp}>
              USE POTION ({potions})
            </button>
            <button type="button" className="sword-idle-hit-btn sword-idle-hit-btn--danger" onClick={handleTntMinecart} disabled={victory || tntMinecarts <= 0}>
              TNT MINECART ({tntMinecarts})
            </button>
          </div>
          <p className="sword-idle-help">Enemy HP bar is red. Your HP bar is green. Enemy attacks automatically.</p>
          <p className="sword-idle-status">{statusText}</p>
        </div>

        <div className="sword-idle-shop sword-idle-shop--upgrades">
          <p className="sword-idle-shop-title">Upgrades</p>
          <div className="sword-idle-shop-grid">
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('click')} disabled={gold < costs.click || victory}>
                +1 Click Damage
                <small>Boosts manual hit strength.</small>
                <span>Cost: {costs.click} | Current: {clickDamage}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('dps')} disabled={gold < costs.dps || victory}>
                +3 Passive Damage
                <small>Auto damage every second.</small>
                <span>Cost: {costs.dps} | Current: {dps}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('crit')} disabled={gold < costs.crit || victory}>
                +2% Crit Chance
                <small>Raises chance for x1.5 hits.</small>
                <span>Cost: {costs.crit} | Current: {(critChance * 100).toFixed(0)}%</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('ore')} disabled={gold < costs.ore || victory}>
                +3% Lucky Drop
                <small>Chance for +{clickDamage} gold on hit.</small>
                <span>Cost: {costs.ore} | Current: {(oreChance * 100).toFixed(0)}%</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('goldps')} disabled={gold < costs.goldps || victory}>
                +3 Passive Gold
                <small>Auto gold income per second.</small>
                <span>Cost: {costs.goldps} | Current: {goldPerSecond}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('loot')} disabled={gold < costs.loot || victory}>
                +8% Bounty Bonus
                <small>More boss and chest rewards.</small>
                <span>Cost: {costs.loot} | Current: x{lootBonus.toFixed(2)}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('hp')} disabled={gold < costs.hp || victory}>
                +8 Max HP
                <small>Increases survival pool.</small>
                <span>Cost: {costs.hp} | Current: {playerMaxHp}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('armor')} disabled={gold < costs.armor || victory}>
                +4.5% Damage Reduction
                <small>Reduces incoming damage.</small>
                <span>Cost: {costs.armor} | Current: {armorReductionPct.toFixed(1)}%</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('regen')} disabled={gold < costs.regen || victory}>
                +1 HP Regen
                <small>Restores HP each second.</small>
                <span>Cost: {costs.regen} | Current: {hpRegen}</span>
              </button>
          </div>
        </div>

        <div className="sword-idle-shop sword-idle-shop--items">
          <p className="sword-idle-shop-title">Items</p>
          <div className="sword-idle-shop-grid sword-idle-shop-grid--items">
              <button type="button" className="sword-idle-shop-btn" onClick={handleBuyPotion} disabled={victory || gold < potionCost}>
                +1 Potion
                <small>Heals +{potionHeal} HP. Use any time.</small>
                <span>Buy: {potionCost}g</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('totem')} disabled={gold < costs.totem || victory}>
                +1 Totem
                <small>Auto-revive once at lethal damage.</small>
                <span>Cost: {costs.totem} | Owned: {totems}</span>
              </button>
              <button type="button" className="sword-idle-shop-btn" onClick={() => buyUpgrade('minecart')} disabled={gold < costs.minecart || victory}>
                +1 TNT Minecart
                <small>One-use explosive for massive burst damage.</small>
                <span>Cost: {costs.minecart} | Owned: {tntMinecarts}</span>
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}
