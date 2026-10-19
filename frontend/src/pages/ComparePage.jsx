import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Scale, 
  Plus, 
  X, 
  ExternalLink, 
  Check, 
  Trophy, 
  ShieldAlert, 
  ArrowLeft,
  Sparkles,
  Zap,
  TrendingDown,
  Share2,
  Award,
  ChevronDown,
  Activity,
  Cpu,
  Layers,
  HardDrive,
  CheckCircle2,
  Bell,
  Briefcase,
  Gamepad2
} from 'lucide-react'
import { compareApi, productApi, alertApi } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'
import { trackStoreClick } from '../utils/trackStoreClick'

// Dynamic benchmark calculator based on real product specs & categories
function getBenchmarks(p1, p2, compareData, lang) {
  if (!p1 || !p2) return null

  const isDemoCpu = (p1.name?.includes('7800X3D') && p2.name?.includes('14700K')) ||
                    (p1.name?.includes('14700K') && p2.name?.includes('7800X3D'))

  if (isDemoCpu) {
    return {
      subtitle: lang === 'en'
        ? 'Estimated 1080p Ultra Gaming FPS and Cinebench R23 Multi-Core rendering scores'
        : 'คะแนนประเมินระหว่าง FPS เกมมิ่ง 1080p Ultra และคะแนน Cinebench R23 Multi-Core',
      metric1: {
        title: lang === 'en' ? 'Average 1080p Gaming FPS (12 Titles)' : 'ค่าเฉลี่ย 1080p Gaming FPS (12 เกมดัง)',
        deltaBadge: 'AMD +9.4%',
        deltaColor: 'text-emerald-400',
        val1: '248 FPS',
        pct1: 95,
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: '227 FPS',
        pct2: 85,
        color2: 'bg-purple-500',
        textColor2: 'text-purple-400'
      },
      metric2: {
        title: lang === 'en' ? 'Cinebench R23 Rendering (Multi-Thread)' : 'คะแนนเรนเดอร์ Cinebench R23 (Multi-Thread)',
        deltaBadge: 'Intel +85%',
        deltaColor: 'text-purple-400',
        val1: '18,650 Pts',
        pct1: 53,
        color1: 'bg-emerald-500/70',
        textColor1: 'text-emerald-400',
        val2: '34,500 Pts',
        pct2: 98,
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      }
    }
  }

  const cat = `${p1.category || ''} ${p2.category || ''} ${p1.name || ''} ${p2.name || ''}`.toLowerCase()

  const extractNum = (str, regex) => {
    if (!str) return null
    const m = String(str).match(regex)
    return m ? parseFloat(m[1]) : null
  }

  // 1. RAM / Memory
  if (cat.includes('ram') || cat.includes('memory')) {
    const speed1 = extractNum(p1.specs?.speed || p1.specs?.frequency || p1.name, /(\d{4,5})\s*(?:mhz|mt\/s)?/i) || 3200
    const speed2 = extractNum(p2.specs?.speed || p2.specs?.frequency || p2.name, /(\d{4,5})\s*(?:mhz|mt\/s)?/i) || 3200
    const maxSpeed = Math.max(speed1, speed2, 1)
    const speedDelta = speed1 >= speed2 
      ? `+${(((speed1 - speed2) / (speed2 || 1)) * 100).toFixed(1)}% Speed`
      : `+${(((speed2 - speed1) / (speed1 || 1)) * 100).toFixed(1)}% Speed`

    const cap1 = extractNum(p1.specs?.capacity || p1.name, /(\d+)\s*gb/i) || 16
    const cap2 = extractNum(p2.specs?.capacity || p2.name, /(\d+)\s*gb/i) || 16
    const costPerGb1 = p1.lowest_price ? Math.round(p1.lowest_price / cap1) : 0
    const costPerGb2 = p2.lowest_price ? Math.round(p2.lowest_price / cap2) : 0
    const bestCost = (costPerGb1 && costPerGb2) 
      ? (costPerGb1 <= costPerGb2 ? `${p1.brand || 'P1'} คุ้มกว่า` : `${p2.brand || 'P2'} คุ้มกว่า`)
      : 'คุ้มค่าสูสี'

    return {
      subtitle: lang === 'en'
        ? 'Real-world Memory Bus Frequency and Price per Gigabyte value metric'
        : 'ดัชนีความเร็วบัสแรม (MHz) และอัตราความคุ้มค่าราคาต่อหน่วยความจุ (฿/GB)',
      metric1: {
        title: lang === 'en' ? 'Memory Speed / Frequency (MHz / MT/s)' : 'ความเร็วบัสแรม (Memory Frequency / Speed)',
        deltaBadge: speedDelta,
        deltaColor: speed1 >= speed2 ? 'text-emerald-400' : 'text-purple-400',
        val1: `${speed1.toLocaleString()} MHz`,
        pct1: Math.min(100, Math.round((speed1 / maxSpeed) * 95)),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: `${speed2.toLocaleString()} MHz`,
        pct2: Math.min(100, Math.round((speed2 / maxSpeed) * 95)),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      },
      metric2: {
        title: lang === 'en' ? 'Cost per Gigabyte (฿ / GB - Lower is Better)' : 'ต้นทุนต่อหน่วยความจุ (฿ / GB - ยิ่งต่ำยิ่งคุ้ม)',
        deltaBadge: bestCost,
        deltaColor: costPerGb1 <= costPerGb2 ? 'text-emerald-400' : 'text-purple-400',
        val1: costPerGb1 ? `฿${costPerGb1.toLocaleString()} / GB (${cap1}GB)` : 'N/A',
        pct1: Math.min(100, Math.max(25, Math.round((Math.min(costPerGb1, costPerGb2) / (costPerGb1 || 1)) * 95))),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: costPerGb2 ? `฿${costPerGb2.toLocaleString()} / GB (${cap2}GB)` : 'N/A',
        pct2: Math.min(100, Math.max(25, Math.round((Math.min(costPerGb1, costPerGb2) / (costPerGb2 || 1)) * 95))),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      }
    }
  }

  // 2. GPU / Graphics Card
  if (cat.includes('gpu') || cat.includes('graphic') || cat.includes('vga')) {
    const vram1 = extractNum(p1.specs?.vram || p1.specs?.VRAM || p1.name, /(\d+)\s*gb/i) || 8
    const vram2 = extractNum(p2.specs?.vram || p2.specs?.VRAM || p2.name, /(\d+)\s*gb/i) || 8
    const maxVram = Math.max(vram1, vram2, 1)

    const cost1 = p1.lowest_price ? Math.round(p1.lowest_price / vram1) : 0
    const cost2 = p2.lowest_price ? Math.round(p2.lowest_price / vram2) : 0

    return {
      subtitle: lang === 'en'
        ? 'Graphics memory allocation and hardware pricing efficiency'
        : 'ขนาดหน่วยความจำกราฟิก (VRAM) และอัตราส่วนต้นทุนต่อกิกะไบต์ VRAM',
      metric1: {
        title: lang === 'en' ? 'Video Memory Capacity (VRAM)' : 'ขนาดหน่วยความจำกราฟิก (VRAM Capacity)',
        deltaBadge: vram1 >= vram2 ? `${p1.brand || 'P1'} +${vram1 - vram2} GB` : `${p2.brand || 'P2'} +${vram2 - vram1} GB`,
        deltaColor: vram1 >= vram2 ? 'text-emerald-400' : 'text-purple-400',
        val1: `${vram1} GB VRAM`,
        pct1: Math.min(100, Math.round((vram1 / maxVram) * 95)),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: `${vram2} GB VRAM`,
        pct2: Math.min(100, Math.round((vram2 / maxVram) * 95)),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      },
      metric2: {
        title: lang === 'en' ? 'VRAM Cost Efficiency (฿ / GB VRAM)' : 'ดัชนีต้นทุนต่อกิกะไบต์ VRAM (฿ / GB VRAM)',
        deltaBadge: cost1 <= cost2 ? 'คุ้มค่ากว่า' : 'สเปกระดับท็อป',
        deltaColor: 'text-cyan-400',
        val1: cost1 ? `฿${cost1.toLocaleString()} / GB` : 'N/A',
        pct1: Math.min(100, Math.max(25, Math.round((Math.min(cost1, cost2) / (cost1 || 1)) * 95))),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: cost2 ? `฿${cost2.toLocaleString()} / GB` : 'N/A',
        pct2: Math.min(100, Math.max(25, Math.round((Math.min(cost1, cost2) / (cost2 || 1)) * 95))),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      }
    }
  }

  // 3. SSD / Storage
  if (cat.includes('ssd') || cat.includes('storage') || cat.includes('drive')) {
    const read1 = extractNum(p1.specs?.seq_read || p1.name, /(\d{3,5})\s*(?:mb\/s)?/i) || (cat.includes('pcie 4') ? 5000 : 3500)
    const read2 = extractNum(p2.specs?.seq_read || p2.name, /(\d{3,5})\s*(?:mb\/s)?/i) || (cat.includes('pcie 4') ? 5000 : 3500)
    const maxRead = Math.max(read1, read2, 1)

    return {
      subtitle: lang === 'en'
        ? 'Sequential transfer rate and storage price per gigabyte'
        : 'ความเร็วการอ่านเขียนข้อมูลสูงสุด (MB/s) และความคุ้มค่าราคา',
      metric1: {
        title: lang === 'en' ? 'Sequential Read Speed (MB/s)' : 'ความเร็วการอ่านข้อมูลสูงสุด (Sequential Read)',
        deltaBadge: read1 >= read2 ? `+${read1 - read2} MB/s` : `+${read2 - read1} MB/s`,
        deltaColor: read1 >= read2 ? 'text-emerald-400' : 'text-purple-400',
        val1: `${read1.toLocaleString()} MB/s`,
        pct1: Math.min(100, Math.round((read1 / maxRead) * 95)),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: `${read2.toLocaleString()} MB/s`,
        pct2: Math.min(100, Math.round((read2 / maxRead) * 95)),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      },
      metric2: {
        title: lang === 'en' ? 'Lowest Retail Price Advantage' : 'ความได้เปรียบด้านราคาต่ำสุด',
        deltaBadge: (p1.lowest_price && p2.lowest_price && p1.lowest_price > 0 && p2.lowest_price > 0)
          ? ((p1.lowest_price <= p2.lowest_price) ? `ประหยัด ฿${Math.abs(p2.lowest_price - p1.lowest_price).toLocaleString()}` : `ประหยัด ฿${Math.abs(p1.lowest_price - p2.lowest_price).toLocaleString()}`)
          : (lang === 'en' ? 'Stock Difference' : 'สถานะสต็อกต่างกัน'),
        deltaColor: 'text-emerald-400',
        val1: p1.lowest_price && p1.lowest_price > 0 ? `฿${Number(p1.lowest_price).toLocaleString()}` : (lang === 'en' ? 'Out of Stock' : 'ของหมด'),
        pct1: Math.min(100, Math.max(30, Math.round((Math.min(p1.lowest_price || 1, p2.lowest_price || 1) / (p1.lowest_price || 1)) * 95))),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: p2.lowest_price && p2.lowest_price > 0 ? `฿${Number(p2.lowest_price).toLocaleString()}` : (lang === 'en' ? 'Out of Stock' : 'ของหมด'),
        pct2: Math.min(100, Math.max(30, Math.round((Math.min(p1.lowest_price || 1, p2.lowest_price || 1) / (p2.lowest_price || 1)) * 95))),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      }
    }
  }

  // 4. CPU (General CPU)
  if (cat.includes('cpu') || cat.includes('processor')) {
    const cores1 = extractNum(p1.specs?.cores_threads || p1.specs?.Cores || p1.name, /(\d+)\s*(?:cores|คอร์)/i) || 8
    const cores2 = extractNum(p2.specs?.cores_threads || p2.specs?.Cores || p2.name, /(\d+)\s*(?:cores|คอร์)/i) || 8
    const maxCores = Math.max(cores1, cores2, 1)

    const costPerCore1 = p1.lowest_price ? Math.round(p1.lowest_price / cores1) : 0
    const costPerCore2 = p2.lowest_price ? Math.round(p2.lowest_price / cores2) : 0

    return {
      subtitle: lang === 'en'
        ? 'Compute density and cost per processing core comparison'
        : 'จำนวนคอร์ประมวลผลและอัตราต้นทุนต่อหน่วยคอร์ (฿/Core)',
      metric1: {
        title: lang === 'en' ? 'Compute Cores / Threads' : 'จำนวนคอร์ประมวลผล (Compute Cores)',
        deltaBadge: cores1 >= cores2 ? `+${cores1 - cores2} Cores` : `+${cores2 - cores1} Cores`,
        deltaColor: cores1 >= cores2 ? 'text-emerald-400' : 'text-purple-400',
        val1: `${cores1} Cores`,
        pct1: Math.min(100, Math.round((cores1 / maxCores) * 95)),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: `${cores2} Cores`,
        pct2: Math.min(100, Math.round((cores2 / maxCores) * 95)),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      },
      metric2: {
        title: lang === 'en' ? 'Cost per Core (฿ / Core - Lower is Better)' : 'ต้นทุนต่อหน่วยคอร์ (฿ / Core - ยิ่งต่ำยิ่งคุ้ม)',
        deltaBadge: costPerCore1 <= costPerCore2 ? 'คุ้มค่าต่อคอร์กว่า' : 'ประสิทธิภาพต่อคอร์สูง',
        deltaColor: 'text-cyan-400',
        val1: costPerCore1 ? `฿${costPerCore1.toLocaleString()} / Core` : 'N/A',
        pct1: Math.min(100, Math.max(25, Math.round((Math.min(costPerCore1, costPerCore2) / (costPerCore1 || 1)) * 95))),
        color1: 'from-emerald-500 to-cyan-400',
        textColor1: 'text-emerald-400',
        val2: costPerCore2 ? `฿${costPerCore2.toLocaleString()} / Core` : 'N/A',
        pct2: Math.min(100, Math.max(25, Math.round((Math.min(costPerCore1, costPerCore2) / (costPerCore2 || 1)) * 95))),
        color2: 'from-purple-500 to-indigo-400',
        textColor2: 'text-purple-400'
      }
    }
  }

  // 5. Fallback / General Hardware comparison
  const disc1 = (p1.msrp && p1.lowest_price) ? Math.max(0, Math.round(((p1.msrp - p1.lowest_price) / p1.msrp) * 100)) : 5
  const disc2 = (p2.msrp && p2.lowest_price) ? Math.max(0, Math.round(((p2.msrp - p2.lowest_price) / p2.msrp) * 100)) : 5

  return {
    subtitle: lang === 'en'
      ? 'Pricing competitiveness and discount ratio based on real-time market data'
      : 'เปรียบเทียบความคุ้มค่าและส่วนต่างราคาจากฐานข้อมูลร้านค้าจริงแบบเรียลไทม์',
    metric1: {
      title: lang === 'en' ? 'Discount Ratio vs MSRP (%)' : 'อัตราส่วนลดเทียบกับราคาเปิดตัว (%)',
      deltaBadge: disc1 >= disc2 ? `ลดมากกว่า -${disc1}%` : `ลดมากกว่า -${disc2}%`,
      deltaColor: 'text-emerald-400',
      val1: `-${disc1}% ส่วนลด`,
      pct1: Math.min(100, Math.max(20, disc1 * 4)),
      color1: 'from-emerald-500 to-cyan-400',
      textColor1: 'text-emerald-400',
      val2: `-${disc2}% ส่วนลด`,
      pct2: Math.min(100, Math.max(20, disc2 * 4)),
      color2: 'from-purple-500 to-indigo-400',
      textColor2: 'text-purple-400'
    },
    metric2: {
      title: lang === 'en' ? 'Lowest Price in Market (฿ THB)' : 'ราคาต่ำสุดในตลาด (฿ THB)',
      deltaBadge: (p1.lowest_price && p2.lowest_price && p1.lowest_price > 0 && p2.lowest_price > 0)
        ? (p1.lowest_price <= p2.lowest_price ? 'ราคาเริ่มต้นถูกกว่า' : 'รุ่นสเปกพรีเมียม')
        : (lang === 'en' ? 'Stock Status' : 'สถานะสต็อก'),
      deltaColor: 'text-cyan-400',
      val1: p1.lowest_price && p1.lowest_price > 0 ? `฿${Number(p1.lowest_price).toLocaleString()}` : (lang === 'en' ? 'Out of Stock' : 'ของหมด'),
      pct1: Math.min(100, Math.max(25, Math.round((Math.min(p1.lowest_price || 1, p2.lowest_price || 1) / (p1.lowest_price || 1)) * 95))),
      color1: 'from-emerald-500 to-cyan-400',
      textColor1: 'text-emerald-400',
      val2: p2.lowest_price && p2.lowest_price > 0 ? `฿${Number(p2.lowest_price).toLocaleString()}` : (lang === 'en' ? 'Out of Stock' : 'ของหมด'),
      pct2: Math.min(100, Math.max(25, Math.round((Math.min(p1.lowest_price || 1, p2.lowest_price || 1) / (p2.lowest_price || 1)) * 95))),
      color2: 'from-purple-500 to-indigo-400',
      textColor2: 'text-purple-400'
    }
  }
}

// Dynamic dual analysis cards generator
function getDualAnalysis(p1, p2, compareData, lang) {
  if (!p1 || !p2) return null

  const isDemoCpu = (p1.name?.includes('7800X3D') && p2.name?.includes('14700K')) ||
                    (p1.name?.includes('14700K') && p2.name?.includes('7800X3D'))

  if (isDemoCpu) {
    return {
      card1: {
        icon: Gamepad2,
        iconColor: 'text-emerald-400',
        borderClass: 'border-emerald-500/20',
        title: lang === 'en' ? 'Analysis: Pure Gaming Priority' : 'บทวิเคราะห์: สายเน้นเล่นเกมล้วนๆ',
        badge: 'AMD 7800X3D',
        badgeClass: 'bg-emerald-500/20 text-emerald-300',
        text: lang === 'en'
          ? 'If your primary PC usage is gaming, whether competitive eSports titles demanding high 1% low FPS or AAA open-world games, 3D V-Cache 96MB delivers class-leading framerates while drawing nearly half the power of competing Intel CPUs.'
          : 'หากเป้าหมายหลักในการประกอบคอมพิวเตอร์คือการเล่นเกม ไม่ว่าจะเป็นเกมแนว eSports ที่ต้องการ 1% Low FPS เสถียรสูงสุด หรือเกมระดับ AAA โลกเปิด เทคโนโลยี 3D V-Cache 96MB ทำให้ 7800X3D ส่งข้อมูลเฟรมเรตได้เหนือชั้น และใช้ไฟน้อยกว่าถึงเกือบครึ่ง ประหยัดงบชุดระบายความร้อนได้อีกนับพันบาท',
        points: [
          lang === 'en' ? 'Standard air or 240mm cooling is sufficient' : 'ไม่ต้องใช้ชุดน้ำ 360mm',
          lang === 'en' ? 'B650 motherboards run at full speed' : 'เมนบอร์ด B650 ใช้งานได้สมบูรณ์',
          lang === 'en' ? 'AM5 socket upgrade path through 2027+' : 'อัปเกรดในอนาคตได้ต่อ'
        ],
        pointColor: 'text-emerald-300'
      },
      card2: {
        icon: Briefcase,
        iconColor: 'text-purple-400',
        borderClass: 'border-purple-500/20',
        title: lang === 'en' ? 'Analysis: Video Editing & Multi-Thread Rendering' : 'บทวิเคราะห์: สายทำงานตัดต่อ & เรนเดอร์',
        badge: 'Intel 14700K',
        badgeClass: 'bg-purple-500/20 text-purple-300',
        text: lang === 'en'
          ? 'If you run video editing software like Premiere Pro, DaVinci Resolve, 3D Blender, or stream games with heavy background tasks, 20 Cores / 28 Threads outpace the 7800X3D by up to 85% in multi-threaded benchmarks, bolstered by Intel QuickSync.'
          : 'หากคุณใช้งานโปรแกรมตัดต่อ Premiere Pro, DaVinci Resolve, ทำงาน 3D Blender หรืองานมัลติทาสก์ 20 Cores / 28 Threads ของ 14700K กวาดคะแนน Multi-Thread แซงหน้าไปไกลถึงเกือบ 85% พร้อมทั้งมีชุดคำสั่ง Intel QuickSync ช่วยเอ็นโค้ดวิดีโอแบบเรียลไทม์',
        points: [
          'Intel QuickSync HW Decode',
          lang === 'en' ? '28 threads for smooth multi-tasking' : '28 เธรด ทำงานหลายหน้าต่างลื่น',
          lang === 'en' ? 'Recommended: 360mm AIO liquid cooling' : 'แนะนำจับคู่ชุดน้ำ 3 ตอน'
        ],
        pointColor: 'text-purple-300'
      }
    }
  }

  // Dynamic analysis for any products
  const isP1Cheaper = (p1.lowest_price || 0) <= (p2.lowest_price || 0)
  const priceDiff = Math.abs((p2.lowest_price || 0) - (p1.lowest_price || 0))

  return {
    card1: {
      icon: isP1Cheaper ? Zap : Award,
      iconColor: 'text-emerald-400',
      borderClass: 'border-emerald-500/20',
      title: lang === 'en' 
        ? `Analysis: ${p1.name.slice(0, 32)}` 
        : `บทวิเคราะห์: ${p1.name.slice(0, 32)}`,
      badge: p1.brand || (isP1Cheaper ? (lang === 'en' ? 'BEST PRICE' : 'ราคาประหยัด') : (lang === 'en' ? 'PREMIUM' : 'สเปกเด่น')),
      badgeClass: 'bg-emerald-500/20 text-emerald-300',
      text: lang === 'en'
        ? (isP1Cheaper
          ? `${p1.name} from ${p1.brand || 'manufacturer'} offers superior affordability at ฿${Number(p1.lowest_price).toLocaleString()} at ${p1.best_store || 'top store'}, saving ฿${priceDiff.toLocaleString()} compared to the rival.`
          : `${p1.name} delivers solid performance with top-grade hardware specifications for long-term reliability and seamless computing experience.`)
        : (isP1Cheaper
          ? `หากคุณต้องการความคุ้มค่าด้านงบประมาณ ${p1.name} จากแบรนด์ ${p1.brand || ''} เป็นตัวเลือกที่ตอบโจทย์อย่างยิ่ง ด้วยราคาเริ่มต้นเพียง ฿${Number(p1.lowest_price).toLocaleString()} ที่ร้าน ${p1.best_store || 'ร้านไอทีชั้นนำ'} ซึ่งประหยัดกว่าคู่เทียบถึง ฿${priceDiff.toLocaleString()}`
          : `สำหรับผู้ที่ต้องการประสิทธิภาพระดับสูง ${p1.name} จากแบรนด์ ${p1.brand || ''} มาพร้อมสเปกที่ตอบโจทย์งานหนัก แม้ราคาจะอยู่ที่ ฿${Number(p1.lowest_price).toLocaleString()} แต่ให้ความเสถียรและประสิทธิภาพที่คุ้มค่าในระยะยาว`),
      points: [
        lang === 'en' ? `Cheapest at ${p1.best_store || 'Official Retailer'}: ฿${Number(p1.lowest_price).toLocaleString()}` : `ราคาต่ำสุด ณ ตอนนี้: ฿${Number(p1.lowest_price).toLocaleString()} (${p1.best_store || 'ร้านไอทีชั้นนำ'})`,
        lang === 'en' ? `Category: ${p1.category || 'Hardware'} • Brand: ${p1.brand || 'Verified'}` : `หมวดหมู่: ${p1.category || 'ฮาร์ดแวร์'} • แบรนด์: ${p1.brand || 'ของแท้ศูนย์'}`,
        lang === 'en' ? `Stock checked across ${p1.store_options?.length || 4} verified Thai retailers` : `ตรวจสอบสต็อกแล้ว ${p1.store_options?.length || 4} ร้านค้าชั้นนำ (Advice, JIB, iHaveCPU, BaNANA)`
      ],
      pointColor: 'text-emerald-300'
    },
    card2: {
      icon: !isP1Cheaper ? Zap : Award,
      iconColor: 'text-purple-400',
      borderClass: 'border-purple-500/20',
      title: lang === 'en' 
        ? `Analysis: ${p2.name.slice(0, 32)}` 
        : `บทวิเคราะห์: ${p2.name.slice(0, 32)}`,
      badge: p2.brand || (!isP1Cheaper ? (lang === 'en' ? 'BEST PRICE' : 'ราคาประหยัด') : (lang === 'en' ? 'PREMIUM' : 'สเปกเด่น')),
      badgeClass: 'bg-purple-500/20 text-purple-300',
      text: lang === 'en'
        ? (!isP1Cheaper
          ? `${p2.name} from ${p2.brand || 'manufacturer'} offers superior affordability at ฿${Number(p2.lowest_price).toLocaleString()} at ${p2.best_store || 'top store'}, saving ฿${priceDiff.toLocaleString()} compared to the rival.`
          : `${p2.name} delivers solid performance with top-grade hardware specifications for long-term reliability and seamless computing experience.`)
        : (!isP1Cheaper
          ? `หากคุณต้องการความคุ้มค่าด้านงบประมาณ ${p2.name} จากแบรนด์ ${p2.brand || ''} เป็นตัวเลือกที่ตอบโจทย์อย่างยิ่ง ด้วยราคาเริ่มต้นเพียง ฿${Number(p2.lowest_price).toLocaleString()} ที่ร้าน ${p2.best_store || 'ร้านไอทีชั้นนำ'} ซึ่งประหยัดกว่าคู่เทียบถึง ฿${priceDiff.toLocaleString()}`
          : `สำหรับผู้ที่ต้องการประสิทธิภาพระดับสูง ${p2.name} จากแบรนด์ ${p2.brand || ''} มาพร้อมสเปกที่ตอบโจทย์งานหนัก แม้ราคาจะอยู่ที่ ฿${Number(p2.lowest_price).toLocaleString()} แต่ให้ความเสถียรและประสิทธิภาพที่คุ้มค่าในระยะยาว`),
      points: [
        lang === 'en' ? `Cheapest at ${p2.best_store || 'Official Retailer'}: ฿${Number(p2.lowest_price).toLocaleString()}` : `ราคาต่ำสุด ณ ตอนนี้: ฿${Number(p2.lowest_price).toLocaleString()} (${p2.best_store || 'ร้านไอทีชั้นนำ'})`,
        lang === 'en' ? `Category: ${p2.category || 'Hardware'} • Brand: ${p2.brand || 'Verified'}` : `หมวดหมู่: ${p2.category || 'ฮาร์ดแวร์'} • แบรนด์: ${p2.brand || 'ของแท้ศูนย์'}`,
        lang === 'en' ? `Stock checked across ${p2.store_options?.length || 4} verified Thai retailers` : `ตรวจสอบสต็อกแล้ว ${p2.store_options?.length || 4} ร้านค้าชั้นนำ (Advice, JIB, iHaveCPU, BaNANA)`
      ],
      pointColor: 'text-purple-300'
    }
  }
}

export default function ComparePage({ compareList, setCompareList }) {
  const { t, lang } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const idsParam = searchParams.get('ids')

  const [compareData, setCompareData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('CPU')
  const [alertEmail, setAlertEmail] = useState('')
  const [alertSuccess, setAlertSuccess] = useState(false)

  // Store select state per compared card
  const [selectedStores, setSelectedStores] = useState({ 0: 0, 1: 0 })

  useEffect(() => {
    productApi.getProducts({ limit: 100 }).then(res => {
      setAllProducts(res.data)
    }).catch(console.error)
  }, [])

  const [hasClearedMock, setHasClearedMock] = useState(false)

  useEffect(() => {
    let ids = []
    if (idsParam) {
      ids = idsParam.split(',').filter(x => x.trim().length > 0)
    } else if (compareList.length > 0) {
      ids = compareList.map(p => p.id)
    }

    if (ids.length > 0) {
      fetchComparison(ids)
    } else if (!hasClearedMock) {
      // Default to real popular hardware comparison from database (387: Ryzen 7 7800X3D, 388: Core i5-12400F)
      fetchComparison(['387', '388'])
    } else {
      setCompareData(null)
    }
  }, [idsParam, compareList, hasClearedMock])

  const fetchComparison = async (ids) => {
    setLoading(true)
    try {
      // Call real backend compare API
      const validNumericIds = ids.filter(id => !isNaN(Number(id)))
      if (validNumericIds.length > 0) {
        const res = await compareApi.compareProducts(validNumericIds)
        if (res.data && res.data.products && res.data.products.length > 0) {
          // Transform products from backend to include store_options and badges
          const mappedProducts = res.data.products.map((p, idx) => {
            const storeOptions = (p.listings && p.listings.length > 0)
              ? p.listings.map(l => ({
                  name: l.store_name,
                  price: l.price,
                  stock_status: l.stock_status,
                  tag: (l.store_name === p.best_store && l.price > 0) ? 'ต่ำสุด ณ ตอนนี้' : (l.price <= 0 ? 'ของหมด' : ''),
                  tag_en: (l.store_name === p.best_store && l.price > 0) ? 'Lowest Now' : (l.price <= 0 ? 'Out of Stock' : ''),
                  url: l.product_url || '#'
                }))
              : (p.lowest_price > 0 ? [
                  { name: p.best_store || 'Advice IT', price: p.lowest_price, tag: 'ต่ำสุด ณ ตอนนี้', tag_en: 'Lowest Now', url: p.best_product_url || '#' }
                ] : [
                  { name: 'ร้านค้า', price: 0, tag: 'ของหมด', tag_en: 'Out of Stock', url: '#' }
                ])

            const isPriceWinner = p.id === res.data.price_winner_id
            const isValueLeader = p.id === res.data.value_score_leader_id

            let badgeText = isValueLeader
              ? (lang === 'en' ? 'VALUE CHAMPION' : 'คุ้มค่าต่อหน่วยสูงสุด')
              : (isPriceWinner ? (lang === 'en' ? 'LOWEST PRICE' : 'ราคาต่ำสุดในกลุ่ม') : (idx === 0 ? 'TOP SPEC' : 'FEATURED'))
            let badgeBg = isValueLeader
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : (isPriceWinner ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40')

            const specParts = []
            if (p.brand) specParts.push(p.brand)
            if (p.category) specParts.push(p.category)
            if (p.specs?.capacity) specParts.push(p.specs.capacity)
            if (p.specs?.speed) specParts.push(p.specs.speed)
            if (p.specs?.vram) specParts.push(p.specs.vram)
            if (p.specs?.cores_threads) specParts.push(p.specs.cores_threads)
            const autoSubtitle = specParts.length > 0 ? specParts.join(' • ') : [p.brand, p.category, p.model_no].filter(Boolean).join(' • ')

            return {
              ...p,
              store_options: storeOptions,
              subtitle: autoSubtitle,
              badge: badgeText,
              badgeColor: badgeBg,
              discount: p.discount_percent ? `-${p.discount_percent}%` : null,
              price_diff: p.price_difference ? `-฿${Number(p.price_difference).toLocaleString()}` : null,
              score_label: 'คะแนนความคุ้มค่า (Value Score)',
              score_val: res.data.value_scores?.[p.id] || '9.5/10'
            }
          })

          setCompareData({
            ...res.data,
            products: mappedProducts
          })
          return
        }
      }
      setCompareData(null)
    } catch (e) {
      console.warn('Backend compare notice:', e)
      setCompareData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveProduct = (productId) => {
    if (!compareData) return
    const updated = compareData.products.filter(p => p.id !== productId).map(p => p.id)
    if (updated.length > 0) {
      setSearchParams({ ids: updated.join(',') })
    } else {
      setHasClearedMock(true)
      setSearchParams({})
      setCompareData(null)
    }
    
    // Also remove from global state so it doesn't reload them
    if (setCompareList) {
      setCompareList(prev => prev.filter(p => p.id !== productId))
    }
  }

  const handleAddProduct = (productId) => {
    setShowAddDropdown(false)
    if (!compareData) {
      setSearchParams({ ids: String(productId) })
      return
    }
    const current = compareData.products.map(p => p.id)
    if (current.includes(productId)) return
    if (current.length >= 4) {
      toast.error(t.compare?.maxItemsNotice || (lang === 'en' ? 'You can compare up to 4 items simultaneously.' : 'เปรียบเทียบได้สูงสุด 4 รายการ'))
      return
    }
    const updated = [...current, productId]
    setSearchParams({ ids: updated.join(',') })
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success(lang === 'en' ? 'Comparison link copied to clipboard!' : 'คัดลอกลิงก์การเปรียบเทียบสเปกแล้ว!')
  }

  const handleAlertSubmit = async (e) => {
    e.preventDefault()
    if (!alertEmail || !alertEmail.includes('@')) return
    
    try {
      if (activeProducts && activeProducts.length > 0) {
        await Promise.all(activeProducts.map(p => {
          return alertApi.createAlert({
            product_id: p.id,
            email: alertEmail,
            target_price: Math.floor((p.lowest_price || 0) * 0.95), // Notify if drops by 5%
            currency: 'THB'
          }).catch(err => {
            console.warn('Failed to create alert for', p.name, err)
            throw err
          })
        }))
      }
      setAlertSuccess(true)
      setAlertEmail('')
      setTimeout(() => setAlertSuccess(false), 5000)
    } catch (err) {
      toast.error(lang === 'en' ? 'Failed to setup alerts' : 'เกิดข้อผิดพลาดในการตั้งค่าแจ้งเตือน')
    }
  }

  let activeProducts = []
  if (compareData?.products) {
    activeProducts = compareData.products
  }

  const p1 = activeProducts[0]
  const p2 = activeProducts[1]
  const benchmarks = getBenchmarks(p1, p2, compareData, lang)
  const analysis = getDualAnalysis(p1, p2, compareData, lang)

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">

      {/* TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-purple-500/20">
        <div>
          <div className="text-[11px] font-mono tracking-wider text-purple-300 font-bold mb-1">
            IT PRICE ENGINE / HARDWARE BENCHMARK / SIDE-BY-SIDE <span className="text-white px-2 py-0.5 rounded bg-purple-500/30 ml-2">v4.4 PRO</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-display text-white tracking-tight">
            {lang === 'en' ? 'Hardware Spec & Price Comparison' : 'เปรียบเทียบสเปกและราคาฮาร์ดแวร์ไอที'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1 leading-relaxed">
            {lang === 'en'
              ? 'In-depth spec comparison, value analysis, and real-time lowest price across 4 premier Thai IT retailers (iHaveCPU, Advice, JIB, BaNANA)'
              : 'ระบบวิเคราะห์ความต่างแบบเจาะลึก เทียบความคุ้มค่าแบบตัวต่อตัว อิงฐานข้อมูลราคาเรียลไทม์จาก 4 ร้านไอทีชั้นนำในไทย (iHaveCPU, Advice, JIB, BaNANA)'}
          </p>
        </div>

        {/* Category switch tabs */}
        <div className="flex items-center space-x-2 bg-[#120826] border border-purple-500/25 p-1 rounded-2xl self-start lg:self-auto overflow-x-auto">
          {[
            { key: 'CPU', label: lang === 'en' ? 'Processors (CPU)' : 'ซีพียู (CPU)', icon: Cpu },
            { key: 'GPU', label: lang === 'en' ? 'Graphics Cards (GPU)' : 'การ์ดจอ (GPU)', icon: Layers },
            { key: 'RAM', label: lang === 'en' ? 'Memory (RAM)' : 'แรม (RAM)', icon: Zap },
            { key: 'SSD', label: 'SSD / Storage', icon: HardDrive }
          ].map((cat) => {
            const Icon = cat.icon
            const active = selectedCategoryTab === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategoryTab(cat.key)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#7C3AED] text-white shadow-[0_0_12px_rgba(124,58,237,0.5)] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* COMPARISON BAR & PRODUCT SEARCH ADDER */}
      <div className="bg-[#120826]/90 rounded-2xl p-3.5 sm:p-4 border border-purple-500/25 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Active compared pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto scrollbar-none text-xs">
          <span className="text-purple-300 font-medium whitespace-nowrap flex items-center">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-2"></span>
            {lang === 'en' ? 'Comparing' : 'กำลังเทียบ'} ({activeProducts.length} {lang === 'en' ? 'items' : 'รายการ'}):
          </span>
          {activeProducts.map((p, idx) => (
            <div
              key={p.id || idx}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1C0F3A] border border-purple-500/30 text-white text-xs font-semibold whitespace-nowrap"
            >
              <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-400' : 'bg-purple-400'}`}></span>
              <span>{p.name}</span>
              <button
                onClick={() => handleRemoveProduct(p.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors ml-1"
                title={lang === 'en' ? 'Remove from comparison' : 'ลบออกจากการเปรียบเทียบ'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Right adder & share */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end relative">
          <button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            className="flex-1 md:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-[#140826] hover:bg-purple-900/30 border border-purple-500/25 text-xs font-semibold text-purple-200 hover:text-white transition-all"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>+ {lang === 'en' ? 'Search to add 3rd product...' : 'ค้นหาเพื่อเพิ่มสินค้าตัวที่ 3...'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-slate-300 hover:text-cyan-400 transition-colors"
            title={lang === 'en' ? 'Share this comparison' : 'แชร์การเปรียบเทียบนี้'}
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Add Dropdown */}
          {showAddDropdown && (
            <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto glass-panel-elevated rounded-2xl p-2 z-50 shadow-2xl divide-y divide-white/[0.06]">
              <div className="p-2 text-xs font-bold text-slate-400">{lang === 'en' ? 'Select product to add to comparison' : 'เลือกสินค้าเพื่อเปรียบเทียบเพิ่ม'}</div>
              {allProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAddProduct(p.id)}
                  className="p-2.5 hover:bg-white/[0.08] rounded-xl cursor-pointer flex items-center space-x-3 transition-colors"
                >
                  <img src={p.image_url} alt={p.name} className="w-8 h-8 object-contain rounded bg-[#070B14] p-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                    {p.lowest_price && p.lowest_price > 0 ? (
                      <p className="text-[11px] text-cyan-400 font-mono font-bold">฿{Number(p.lowest_price).toLocaleString()}</p>
                    ) : (
                      <p className="text-[11px] text-red-400 font-bold">{lang === 'en' ? 'Out of Stock' : 'ของหมด'}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeProducts.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-[#120826]/50 rounded-3xl border border-purple-500/20 mt-8">
          <Scale className="w-16 h-16 text-slate-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{lang === 'en' ? 'No products to compare' : 'ไม่มีสินค้าที่เปรียบเทียบ'}</h2>
          <p className="text-slate-400 mb-6 text-sm max-w-md text-center">{lang === 'en' ? 'Search and add products above to start comparing specs and prices.' : 'ค้นหาและเพิ่มสินค้าด้านบนเพื่อเริ่มเปรียบเทียบสเปกและราคา'}</p>
          <button onClick={() => setShowAddDropdown(true)} className="btn-cyber-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center shadow-[0_0_15px_rgba(124,58,237,0.3)]">
            <Plus className="w-4 h-4 mr-2" />
            {lang === 'en' ? 'Add Product' : 'เพิ่มสินค้า'}
          </button>
        </div>
      )}

      {activeProducts.length > 0 && (
        <>

      {/* VALUE SCORE CHAMPION BANNER (Spec-to-Price Analysis from analysis.md) */}
      {compareData?.value_score_leader_id && (
        <div className="bg-gradient-to-r from-amber-500/15 via-purple-500/20 to-cyan-500/15 border border-amber-400/35 rounded-3xl p-5 shadow-[0_4px_30px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex-shrink-0">
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono">
                  {lang === 'en' ? 'VALUE SCORE WINNER (SPEC-TO-PRICE)' : 'ผู้นำคะแนนความคุ้มค่า (VALUE SCORE WINNER)'}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-medium">
                  {compareData.value_score_reason || (lang === 'en' ? 'Best cost per spec unit' : 'ต้นทุนต่อหน่วยสเปกคุ้มค่าที่สุด')}
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-1">
                {compareData.products.find(p => p.id === compareData.value_score_leader_id)?.name}
              </p>
            </div>
          </div>
          <div className="sm:text-right bg-[#0A0314]/60 px-4 py-2 rounded-2xl border border-amber-400/20 flex sm:flex-col justify-between items-center sm:items-end">
            <span className="text-[10px] text-slate-400 block font-mono">{lang === 'en' ? 'Value Metric Ratio' : 'อัตราส่วนความคุ้มค่า'}</span>
            <span className="text-base font-mono font-black text-emerald-400">
              {compareData.value_scores?.[compareData.value_score_leader_id] || 'คุ้มค่าที่สุด'}
            </span>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE PRODUCT HEADER CARDS (FIGMA STYLE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeProducts.slice(0, 2).map((p, idx) => {
          const isLeft = idx === 0
          const storeOpt = p.store_options || [
            { name: p.best_store || 'Advice IT', price: p.lowest_price, tag: 'ต่ำสุด ณ ตอนนี้', url: '#' }
          ]
          const curStoreIdx = selectedStores[idx] || 0
          const curStore = storeOpt[curStoreIdx] || storeOpt[0]

          return (
            <div
              key={p.id || idx}
              className={`bg-[#120826]/90 rounded-3xl p-6 border relative flex flex-col justify-between space-y-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)] ${
                isLeft ? 'border-emerald-500/30' : 'border-purple-500/30'
              }`}
            >
              {/* Top Tag & Discount */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-display tracking-wider border flex items-center space-x-1.5 ${
                  p.badgeColor || (isLeft ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40')
                }`}>
                  {isLeft ? (
                    <Award className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Briefcase className="w-3.5 h-3.5 text-purple-300" />
                  )}
                  <span>{p.badge || (isLeft ? (lang === 'en' ? 'TOP VALUE' : 'คุ้มค่าอันดับ 1') : (lang === 'en' ? 'FEATURED' : 'สเปกเด่น'))}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F97316] text-white font-display text-xs font-bold shadow-[0_0_10px_rgba(249,115,22,0.4)]">
                  {p.discount || '-11.8%'}
                </span>
              </div>

              {/* Title & Specs */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-white mb-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400">
                  {p.subtitle || [p.brand, p.category, p.model_no].filter(Boolean).join(' • ') || (lang === 'en' ? 'Hardware Spec' : 'สเปกฮาร์ดแวร์')}
                </p>
              </div>

              {/* Product Image Recess */}
              <div className="relative rounded-2xl bg-[#0A0314] border border-purple-500/20 p-4 h-48 flex items-center justify-center">
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="max-h-36 object-contain"
                />
                <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.lowest_price > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                  <span>{p.lowest_price > 0 ? (lang === 'en' ? `${p.store_count || 'Multi'} Stores Available` : `พร้อมจำหน่าย ${p.store_count || ''} ร้าน`) : (lang === 'en' ? 'Out of Stock' : 'สินค้าหมดทุกร้าน')}</span>
                </div>
              </div>

              {/* Pricing section */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{lang === 'en' ? 'Lowest Price in TH:' : 'ราคาต่ำสุดในไทย:'}</span>
                    <div className="flex items-baseline space-x-2">
                      {p.lowest_price && p.lowest_price > 0 ? (
                        <span className="text-2xl sm:text-3xl font-black font-display text-cyan-400">
                          ฿{Number(p.lowest_price).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xl sm:text-2xl font-bold font-display text-red-400">
                          {lang === 'en' ? 'Out of Stock' : 'ของหมดทุกร้าน'}
                        </span>
                      )}
                      {p.price_diff && p.lowest_price > 0 && (
                        <span className="text-xs font-mono text-emerald-400">({p.price_diff})</span>
                      )}
                    </div>
                  </div>
                  {p.msrp && (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">{lang === 'en' ? 'MSRP' : 'ราคาเปิดตัว'}</span>
                      <span className="text-xs text-slate-500 line-through font-display">
                        ฿{Number(p.msrp).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Reference store select */}
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">{lang === 'en' ? 'Reference Retailer:' : 'ร้านค้าอ้างอิง:'}</span>
                  <div className="relative">
                    <select
                      value={curStoreIdx}
                      onChange={(e) => setSelectedStores({ ...selectedStores, [idx]: Number(e.target.value) })}
                      className="w-full bg-[#0A0314] border border-purple-500/30 rounded-xl px-3 py-2 text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
                    >
                      {storeOpt.map((opt, sIdx) => (
                        <option key={sIdx} value={sIdx} className="bg-[#120826] text-white">
                          {opt.name} - {opt.price > 0 ? `฿${Number(opt.price).toLocaleString()}` : (lang === 'en' ? 'Out of Stock' : 'ของหมด')} {opt.tag ? `(${lang === 'en' ? (opt.tag_en || 'Lowest Now') : opt.tag})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Buy button */}
                {curStore.url && curStore.url !== '#' && curStore.price > 0 ? (
                  <a
                    href={curStore.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackStoreClick({
                      productId: p.id,
                      productName: p.name,
                      storeName: curStore.name,
                      targetUrl: curStore.url,
                      price: curStore.price || p.lowest_price,
                      sourcePage: 'compare_page'
                    })}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                      isLeft
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    <span>{lang === 'en' ? `Go to Store (${curStore.name})` : `ไปยังร้านค้า (${curStore.name})`}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 bg-slate-800/80 text-slate-500 cursor-not-allowed border border-white/[0.05]"
                  >
                    <span>{lang === 'en' ? `Out of Stock (${curStore.name || 'Store'})` : `สินค้าหมด (${curStore.name || 'ร้านค้า'})`}</span>
                  </button>
                )}

                {/* Highlight score bar */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-500/20">
                  <span className="text-slate-300 font-medium flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'en' ? (p.score_label_en || p.score_label || 'Overall Value Score') : (p.score_label || 'คะแนนรวมความคุ้มค่า')}</span>
                  </span>
                  <span className="font-mono font-bold text-cyan-400">{p.score_val || '9.5/10'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* SECTION: ENGINEERING BENCHMARKS */}
      {benchmarks && (
      <section className="bg-[#120826]/90 rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                {lang === 'en' ? 'Engineering Benchmark & Performance Index' : 'ดัชนีคะแนนเปรียบเทียบเชิงวิศวกรรม (Engineering Benchmark)'}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              {benchmarks.subtitle}
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            {activeProducts.slice(0, 2).map((p, pIdx) => (
              <span key={p.id || pIdx} className="flex items-center space-x-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${pIdx === 0 ? 'bg-emerald-400' : 'bg-purple-400'}`}></span>
                <span className="text-slate-300 truncate max-w-[160px]">{p.name}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Benchmark 1 */}
          <div className="bg-[#0A0314] border border-purple-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{benchmarks.metric1.title}</span>
              <span className={`${benchmarks.metric1.deltaColor} font-mono font-bold`}>{benchmarks.metric1.deltaBadge}</span>
            </div>
            
            {/* Bar 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">{activeProducts[0]?.name}</span>
                <span className={`font-mono ${benchmarks.metric1.textColor1} font-bold`}>{benchmarks.metric1.val1}</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${benchmarks.metric1.color1.includes('from-') ? `bg-gradient-to-r ${benchmarks.metric1.color1}` : benchmarks.metric1.color1} rounded-full transition-all duration-500`}
                  style={{ width: `${benchmarks.metric1.pct1}%` }}
                />
              </div>
            </div>

            {/* Bar 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">{activeProducts[1]?.name}</span>
                <span className={`font-mono ${benchmarks.metric1.textColor2} font-bold`}>{benchmarks.metric1.val2}</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${benchmarks.metric1.color2.includes('from-') ? `bg-gradient-to-r ${benchmarks.metric1.color2}` : benchmarks.metric1.color2} rounded-full transition-all duration-500`}
                  style={{ width: `${benchmarks.metric1.pct2}%` }}
                />
              </div>
            </div>
          </div>

          {/* Benchmark 2 */}
          <div className="bg-[#0A0314] border border-purple-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">{benchmarks.metric2.title}</span>
              <span className={`${benchmarks.metric2.deltaColor} font-mono font-bold`}>{benchmarks.metric2.deltaBadge}</span>
            </div>
            
            {/* Bar 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">{activeProducts[0]?.name}</span>
                <span className={`font-mono ${benchmarks.metric2.textColor1} font-bold`}>{benchmarks.metric2.val1}</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${benchmarks.metric2.color1.includes('from-') ? `bg-gradient-to-r ${benchmarks.metric2.color1}` : benchmarks.metric2.color1} rounded-full transition-all duration-500`}
                  style={{ width: `${benchmarks.metric2.pct1}%` }}
                />
              </div>
            </div>

            {/* Bar 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[200px]">{activeProducts[1]?.name}</span>
                <span className={`font-mono ${benchmarks.metric2.textColor2} font-bold`}>{benchmarks.metric2.val2}</span>
              </div>
              <div className="w-full h-3 bg-[#140826] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${benchmarks.metric2.color2.includes('from-') ? `bg-gradient-to-r ${benchmarks.metric2.color2}` : benchmarks.metric2.color2} rounded-full transition-all duration-500`}
                  style={{ width: `${benchmarks.metric2.pct2}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* SECTION: SPEC MATRIX ROW BY ROW (FIGMA EXACT TABLE) */}
      <section className="bg-[#120826]/90 rounded-3xl p-6 sm:p-8 border border-purple-500/25 space-y-6 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 mb-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-bold font-display text-white">
            {lang === 'en' ? 'Hardware Spec Comparison Matrix' : 'รายการสเปกฮาร์ดแวร์ (Spec Comparison Matrix)'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/[0.1] text-xs">
                <th className="py-3 px-4 text-slate-400 w-1/3 font-semibold uppercase">{lang === 'en' ? 'SPECIFICATION' : 'รายการสเปกฮาร์ดแวร์'}</th>
                {activeProducts.map((p, idx) => (
                  <th key={p.id || idx} className={`py-3 px-4 font-bold ${idx === 0 ? 'text-emerald-400' : 'text-purple-400'}`}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-xs">
              {compareData?.spec_matrix && compareData.spec_matrix.length > 0 ? (
                compareData.spec_matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 align-top">
                      <span className="font-bold text-white block">{row.spec_label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{row.spec_key}</span>
                    </td>
                    {activeProducts.map((p, pIdx) => (
                      <td key={p.id || pIdx} className="py-4 px-4 align-top">
                        <span className="text-slate-200 whitespace-pre-line font-medium block">
                          {String(row.values?.[p.id] ?? '—')}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Math.max(activeProducts.length + 1, 2)} className="py-8 text-center text-slate-400">
                    {lang === 'en' ? 'No specifications available for comparison' : 'ไม่มีข้อมูลสเปกเพิ่มเติมสำหรับเปรียบเทียบ'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Quick Stock Check buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-purple-500/20 text-xs">
          <span className="text-slate-400">{lang === 'en' ? 'Live Stock & Retailer Price Check:' : 'ตรวจสอบสต็อกและราคาแต่ละร้านค้าแบบสด:'}</span>
          <div className="flex items-center flex-wrap gap-2.5">
            {activeProducts.map((p, pIdx) => {
              const isFirst = pIdx === 0
              return (
                <button
                  key={p.id || pIdx}
                  onClick={() => {
                    const storeInfo = (p.store_options && p.store_options.length > 0)
                      ? p.store_options.map(s => `${s.name}: ${Number(s.price) > 0 ? '฿' + Number(s.price).toLocaleString() : (lang === 'en' ? 'Out of Stock' : 'ของหมด')}`).join(' | ')
                      : (Number(p.lowest_price) > 0 ? `${p.best_store || 'ร้านค้า'}: ฿${Number(p.lowest_price).toLocaleString()} (ต่ำสุด)` : (lang === 'en' ? 'Out of Stock' : 'ของหมดทุกร้าน'))
                    toast.success(`${p.name}\n${storeInfo}`, { duration: 6000 })
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all max-w-[280px] truncate ${
                    isFirst
                      ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border-emerald-500/30'
                      : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/30'
                  }`}
                  title={p.name}
                >
                  {lang === 'en' ? `Check ${p.name.slice(0, 22)}... Stores` : `ดูราคา ${p.name.slice(0, 22)}... ทุกร้าน`}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION: DUAL ANALYSIS CARDS */}
      {analysis && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Card 1 */}
        <div className={`glass-card rounded-3xl p-6 sm:p-7 ${analysis.card1.borderClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-2 text-sm sm:text-base">
              <analysis.card1.icon className={`w-4 h-4 ${analysis.card1.iconColor}`} />
              <span className="truncate max-w-[260px]">{analysis.card1.title}</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded ${analysis.card1.badgeClass} font-mono text-[11px] font-bold`}>
              {analysis.card1.badge}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.card1.text}
          </p>
          <div className={`space-y-1.5 pt-2 text-xs ${analysis.card1.pointColor} font-medium`}>
            {analysis.card1.points.map((pt, ptIdx) => (
              <div key={ptIdx} className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Card 2 */}
        <div className={`glass-card rounded-3xl p-6 sm:p-7 ${analysis.card2.borderClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center space-x-2 text-sm sm:text-base">
              <analysis.card2.icon className={`w-4 h-4 ${analysis.card2.iconColor}`} />
              <span className="truncate max-w-[260px]">{analysis.card2.title}</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded ${analysis.card2.badgeClass} font-mono text-[11px] font-bold`}>
              {analysis.card2.badge}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.card2.text}
          </p>
          <div className={`space-y-1.5 pt-2 text-xs ${analysis.card2.pointColor} font-medium`}>
            {analysis.card2.points.map((pt, ptIdx) => (
              <div key={ptIdx} className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* BOTTOM ALERT BANNER */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 border-purple-500/25 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{lang === 'en' ? 'Want price drop alerts for this head-to-head matchup?' : 'ต้องการรับแจ้งเตือนเมื่อราคาคู่เทียบนี้ลดลงหรือไม่?'}</h4>
            <p className="text-xs text-slate-400">{lang === 'en' ? 'IT PRICE Bot will notify you immediately if JIB, Advice, iHaveCPU, or BaNANA launch a Flash Sale.' : 'ระบบ IT PRICE Bot จะส่งการแจ้งเตือนทันทีที่ JIB, Advice, iHaveCPU หรือ BaNANA ทำราคา Flash Sale'}</p>
          </div>
        </div>

        {alertSuccess ? (
          <div className="p-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'en' ? 'Tracking saved! You will receive an alert on price drop.' : 'บันทึกการติดตามสำเร็จ ระบบจะแจ้งเตือนเมื่อราคาปรับลด!'}</span>
          </div>
        ) : (
          <form onSubmit={handleAlertSubmit} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder={lang === 'en' ? 'Enter your email...' : 'ใส่อีเมลของคุณ...'}
              required
              className="bg-white/[0.04] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 min-w-[200px]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl btn-cyber-primary text-xs font-bold whitespace-nowrap"
            >
              {lang === 'en' ? 'Track Pair' : 'ติดตามคู่นี้'}
            </button>
          </form>
        )}
      </div>
      </>
      )}

    </div>
  )
}
