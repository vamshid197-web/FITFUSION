import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {
  wrapInStudio,
  renderTShirtSvg,
  renderPoloSvg,
  renderShirtSvg,
  renderHoodieSvg,
  renderJeansSvg,
  renderPantsSvg,
  renderShortsSvg,
  renderSkirtSvg,
  renderDressSvg,
  renderLeatherJacketSvg,
  renderBlazerSuitSvg,
  renderCoatSvg,
  renderEthnicSvg,
  renderFootwearSvg,
  renderHeadwearSvg,
  renderBagSvg,
  renderAccessorySvg,
  renderCulturalSvg
} from './garmentSvgRenderer.js';

// Master category structure definition matching prompt exactly
const ALL_CATEGORIES = [
  {
    group: 'Tops',
    category: 'T-Shirts',
    dir: 'men/tshirts',
    archetype: 'tshirt',
    items: [
      { sub: 'T-Shirt', name: 'Classic Crew Neck T-Shirt', gender: 'Men', price: 699, color: '#18181B' },
      { sub: 'Oversized T-Shirt', name: 'Oversized Black T-Shirt', gender: 'Men', price: 999, color: '#18181B' },
      { sub: 'Longline T-Shirt', name: 'Longline Curved Hem T-Shirt', gender: 'Men', price: 849, color: '#374151' },
      { sub: 'Polo T-Shirt', name: 'Classic Piqué Polo T-Shirt', gender: 'Men', price: 1199, color: '#1E3A8A' },
      { sub: 'V-Neck T-Shirt', name: 'Premium V-Neck T-Shirt', gender: 'Men', price: 649, color: '#F8FAFC' },
      { sub: 'Henley T-Shirt', name: 'Waffle Knit Henley T-Shirt', gender: 'Men', price: 899, color: '#3F6212' },
      { sub: 'Graphic T-Shirt', name: 'Urban Graphic Print T-Shirt', gender: 'Unisex', price: 899, color: '#27272A' },
      { sub: 'Crop Top', name: 'Ribbed Cotton Crop Top', gender: 'Women', price: 549, color: '#F472B6', dir: 'women/tops' },
      { sub: 'Tank Top', name: 'Scoop Neck Stretch Tank Top', gender: 'Women', price: 499, color: '#F8FAFC', dir: 'women/tops' },
      { sub: 'Halter Top', name: 'Satin Tie-Back Halter Top', gender: 'Women', price: 899, color: '#065F46', dir: 'women/tops' },
      { sub: 'Tube Top', name: 'Seamless Strapless Tube Top', gender: 'Women', price: 449, color: '#18181B', dir: 'women/tops' },
      { sub: 'Off-Shoulder Top', name: 'Ruffled Off-Shoulder Top', gender: 'Women', price: 949, color: '#B91C1C', dir: 'women/tops' },
      { sub: 'Strapless Top', name: 'Structured Strapless Corset Top', gender: 'Women', price: 1199, color: '#18181B', dir: 'women/tops' },
      { sub: 'Wrap Top', name: 'Flax Linen Wrap Top', gender: 'Women', price: 1049, color: '#C2410C', dir: 'women/tops' },
      { sub: 'Peplum Top', name: 'Tailored Peplum Flounce Top', gender: 'Women', price: 899, color: '#1D4ED8', dir: 'women/tops' },
      { sub: 'Camisole', name: 'Silk Lace Trim Camisole', gender: 'Women', price: 799, color: '#FDF2F8', dir: 'women/tops' },
      { sub: 'Bodysuit', name: 'Sculpting Seamless Bodysuit', gender: 'Women', price: 999, color: '#451A03', dir: 'women/tops' },
      { sub: 'Tunic', name: 'Embroidered Longline Tunic Top', gender: 'Women', price: 1299, color: '#0D9488', dir: 'women/tops' },
      { sub: 'Sports Top', name: 'Breathable Training Sports Top', gender: 'Unisex', price: 799, color: '#84CC16', dir: 'sports' },
      { sub: 'Compression Top', name: 'High-Impact Compression Top', gender: 'Men', price: 899, color: '#18181B', dir: 'sports' },
      { sub: 'Thermal Top', name: 'Merino Wool Thermal Base Layer', gender: 'Unisex', price: 899, color: '#334155', dir: 'sleepwear' }
    ]
  },
  {
    group: 'Shirts',
    category: 'Shirts',
    dir: 'men/shirts',
    archetype: 'shirt',
    items: [
      { sub: 'Casual Shirt', name: 'Relaxed Oxford Casual Shirt', gender: 'Men', price: 1299, color: '#38BDF8' },
      { sub: 'Formal Shirt', name: 'Executive Crisp Formal Shirt', gender: 'Men', price: 1499, color: '#F8FAFC' },
      { sub: 'Dress Shirt', name: 'French Cuff Luxury Dress Shirt', gender: 'Men', price: 1899, color: '#F8FAFC' },
      { sub: 'Oxford Shirt', name: 'Classic Heavy Oxford Button-Down', gender: 'Men', price: 1399, color: '#1E3A8A' },
      { sub: 'Denim Shirt', name: 'Western Washed Indigo Denim Shirt', gender: 'Men', price: 1699, color: '#2563EB' },
      { sub: 'Linen Shirt', name: 'Pure Normandy Linen Shirt', gender: 'Men', price: 1999, color: '#E5E7EB' },
      { sub: 'Hawaiian Shirt', name: 'Tropical Floral Print Hawaiian Shirt', gender: 'Men', price: 1199, color: '#059669' },
      { sub: 'Flannel Shirt', name: 'Buffalo Plaid Heavy Flannel Shirt', gender: 'Men', price: 1499, color: '#991B1B' },
      { sub: 'Check Shirt', name: 'Smart Gingham Check Shirt', gender: 'Men', price: 1299, color: '#1E3A8A' },
      { sub: 'Printed Shirt', name: 'Modern Geometric Printed Shirt', gender: 'Men', price: 1399, color: '#18181B' },
      { sub: 'Oversized Shirt', name: 'Drop-Shoulder Boxy Oversized Shirt', gender: 'Unisex', price: 1499, color: '#60A5FA' },
      { sub: 'Mandarin Collar Shirt', name: 'Band Collar Kurta-Style Shirt', gender: 'Men', price: 1349, color: '#FEF3C7' },
      { sub: 'Rugby Shirt', name: 'Vintage Heavyweight Rugby Shirt', gender: 'Men', price: 1599, color: '#1E3A8A' },
      { sub: 'Polo Shirt', name: 'Double Mercerized Polo Shirt', gender: 'Men', price: 1299, color: '#881337' },
      { sub: 'Tie-Dye Shirt', name: 'Hand-Dyed Resort Tie-Dye Shirt', gender: 'Unisex', price: 1299, color: '#1D4ED8' },
      { sub: 'Short-Sleeve Shirt', name: 'Camp Collar Short-Sleeve Shirt', gender: 'Men', price: 1199, color: '#4D7C0F' },
      { sub: 'Long-Sleeve Shirt', name: 'Peached Cotton Long-Sleeve Shirt', gender: 'Men', price: 1399, color: '#374151' },
      { sub: 'Shirt Dress', name: 'Belted Cotton Poplin Shirt Dress', gender: 'Women', price: 1799, color: '#4D7C0F', dir: 'women/dresses' }
    ]
  },
  {
    group: 'Sweaters & Sweatshirts',
    category: 'Hoodies',
    dir: 'men/hoodies',
    archetype: 'hoodie',
    items: [
      { sub: 'Sweater', name: 'Merino Wool Crewneck Sweater', gender: 'Men', price: 1899, color: '#4338CA' },
      { sub: 'Pullover', name: 'Fine-Knit Cotton Cashmere Pullover', gender: 'Men', price: 1799, color: '#047857' },
      { sub: 'Cardigan', name: 'Horn-Button Chunky Knit Cardigan', gender: 'Men', price: 2199, color: '#78350F' },
      { sub: 'V-Neck Sweater', name: 'Classic V-Neck Lightweight Sweater', gender: 'Men', price: 1699, color: '#1E293B' },
      { sub: 'Turtleneck Sweater', name: 'Ribbed Roll-Neck Turtleneck Sweater', gender: 'Men', price: 1999, color: '#18181B' },
      { sub: 'Crewneck Sweater', name: 'Waffle Stitch Crewneck Sweater', gender: 'Men', price: 1799, color: '#B45309' },
      { sub: 'Sweatshirt', name: 'Classic Heavyweight Loopback Sweatshirt', gender: 'Unisex', price: 1499, color: '#64748B' },
      { sub: 'Oversized Sweatshirt', name: 'Vintage Washed Oversized Sweatshirt', gender: 'Unisex', price: 1699, color: '#334155' },
      { sub: 'Zip-Up Sweatshirt', name: 'Quarter-Zip Fleece Sweatshirt', gender: 'Men', price: 1599, color: '#1E3A8A' },
      { sub: 'Hoodie', name: 'Heavy 400 GSM Kangaroo Pocket Hoodie', gender: 'Unisex', price: 1899, color: '#18181B' },
      { sub: 'Oversized Hoodie', name: 'Relaxed Streetwear Oversized Hoodie', gender: 'Unisex', price: 2099, color: '#27272A' },
      { sub: 'Zip-Up Hoodie', name: 'Thermal Lined Full Zip-Up Hoodie', gender: 'Unisex', price: 1999, color: '#0F172A' },
      { sub: 'Cropped Hoodie', name: 'Raw Hem Fleece Cropped Hoodie', gender: 'Women', price: 1499, color: '#F472B6', dir: 'women/tops' },
      { sub: 'Fleece', name: 'Polar Fleece Quarter-Zip Pullover', gender: 'Unisex', price: 1799, color: '#0284C7' },
      { sub: 'Turtleneck', name: 'Fitted Stretch Thermal Turtleneck', gender: 'Women', price: 1299, color: '#18181B', dir: 'women/tops' }
    ]
  },
  {
    group: 'Jeans',
    category: 'Jeans & Pants',
    dir: 'men/jeans',
    archetype: 'jeans',
    items: [
      { sub: 'Regular Jeans', name: 'Classic 5-Pocket Regular Fit Jeans', gender: 'Men', price: 1799, color: '#2563EB' },
      { sub: 'Slim-Fit Jeans', name: 'Streamlined Stretch Slim-Fit Jeans', gender: 'Men', price: 1899, color: '#1D4ED8' },
      { sub: 'Skinny Jeans', name: 'Power Stretch Mid-Rise Skinny Jeans', gender: 'Men', price: 1699, color: '#1E3A8A' },
      { sub: 'Straight-Leg Jeans', name: 'Authentic Vintage Straight-Leg Jeans', gender: 'Men', price: 1999, color: '#3B82F6' },
      { sub: 'Relaxed Jeans', name: 'Roomy Comfort Relaxed Jeans', gender: 'Men', price: 1899, color: '#60A5FA' },
      { sub: 'Loose-Fit Jeans', name: '90s Skater Loose-Fit Jeans', gender: 'Unisex', price: 2099, color: '#1E40AF' },
      { sub: 'Wide-Leg Jeans', name: 'High-Waist Drape Wide-Leg Jeans', gender: 'Women', price: 2199, color: '#93C5FD', dir: 'women/jeans' },
      { sub: 'Bootcut Jeans', name: 'Retro Tailored Bootcut Jeans', gender: 'Men', price: 1999, color: '#1E3A8A' },
      { sub: 'Flared Jeans', name: '70s High-Rise Flared Denim Jeans', gender: 'Women', price: 2299, color: '#2563EB', dir: 'women/jeans' },
      { sub: 'Bell-Bottom Jeans', name: 'Dramatic Flare Bell-Bottom Jeans', gender: 'Women', price: 2399, color: '#1D4ED8', dir: 'women/jeans' },
      { sub: 'Mom Jeans', name: 'Tapered High-Waist Vintage Mom Jeans', gender: 'Women', price: 1899, color: '#60A5FA', dir: 'women/jeans' },
      { sub: 'Boyfriend Jeans', name: 'Slouchy Relaxed Fit Boyfriend Jeans', gender: 'Women', price: 1999, color: '#93C5FD', dir: 'women/jeans' },
      { sub: 'Dad Jeans', name: 'Heavyweight Rigid Denim Dad Jeans', gender: 'Men', price: 2099, color: '#3B82F6' },
      { sub: 'Cargo Jeans', name: 'Multi-Pocket Utility Cargo Jeans', gender: 'Men', price: 2299, color: '#18181B' },
      { sub: 'Ripped Jeans', name: 'Distressed Knee Slash Ripped Jeans', gender: 'Men', price: 1999, color: '#2563EB' },
      { sub: 'Distressed Jeans', name: 'Heavy Wash Vintage Distressed Jeans', gender: 'Unisex', price: 2199, color: '#3B82F6' },
      { sub: 'High-Waist Jeans', name: 'Sculpt & Hold High-Waist Jeans', gender: 'Women', price: 2099, color: '#1E3A8A', dir: 'women/jeans' },
      { sub: 'Low-Waist Jeans', name: 'Y2K Relaxed Low-Waist Denim Jeans', gender: 'Women', price: 1999, color: '#93C5FD', dir: 'women/jeans' },
      { sub: 'Mid-Waist Jeans', name: 'Everyday Classic Mid-Waist Jeans', gender: 'Women', price: 1799, color: '#1D4ED8', dir: 'women/jeans' },
      { sub: 'Cropped Jeans', name: 'Ankle Grazing Frayed Cropped Jeans', gender: 'Women', price: 1899, color: '#60A5FA', dir: 'women/jeans' },
      { sub: 'Jeggings', name: 'Ultra-Comfort Elastic Waist Jeggings', gender: 'Women', price: 1299, color: '#18181B', dir: 'women/jeans' }
    ]
  },
  {
    group: 'Trousers & Pants',
    category: 'Jeans & Pants',
    dir: 'men/trousers',
    archetype: 'pants',
    items: [
      { sub: 'Formal Trousers', name: 'Tailored Flat-Front Formal Trousers', gender: 'Men', price: 1699, color: '#1E293B' },
      { sub: 'Casual Trousers', name: 'Relaxed Everyday Casual Trousers', gender: 'Men', price: 1499, color: '#475569' },
      { sub: 'Chinos', name: 'Garment-Dyed Slim Stretch Chinos', gender: 'Men', price: 1599, color: '#D97706' },
      { sub: 'Cargo Pants', name: 'Tactical Multi-Pocket Cargo Pants', gender: 'Men', price: 1899, color: '#3F6212' },
      { sub: 'Joggers', name: 'French Terry Cuffed Streetwear Joggers', gender: 'Unisex', price: 1399, color: '#18181B' },
      { sub: 'Track Pants', name: 'Breathable Training Track Pants', gender: 'Unisex', price: 1299, color: '#0F172A' },
      { sub: 'Sweatpants', name: 'Heavy Brushed Fleece Lounge Sweatpants', gender: 'Unisex', price: 1499, color: '#64748B' },
      { sub: 'Palazzo Pants', name: 'Wide Flowing Pleated Palazzo Pants', gender: 'Women', price: 1399, color: '#BE123C', dir: 'women/ethnic' },
      { sub: 'Wide-Leg Pants', name: 'Tailored High-Waist Wide-Leg Pants', gender: 'Women', price: 1899, color: '#1E293B', dir: 'women/jeans' },
      { sub: 'Straight Pants', name: 'Sharp Creased Straight Fit Pants', gender: 'Men', price: 1599, color: '#334155' },
      { sub: 'Skinny Pants', name: 'Stretch Ankle Fit Skinny Trousers', gender: 'Women', price: 1499, color: '#18181B', dir: 'women/jeans' },
      { sub: 'Tapered Pants', name: 'Modern Pleated Tapered Pants', gender: 'Men', price: 1699, color: '#1E293B' },
      { sub: 'Ankle Pants', name: 'Cropped Hem Smart Ankle Pants', gender: 'Men', price: 1549, color: '#475569' },
      { sub: 'Pleated Pants', name: 'Double Reverse Pleat Heritage Trousers', gender: 'Men', price: 1899, color: '#78350F' },
      { sub: 'Linen Pants', name: 'Drawstring Summer Pure Linen Pants', gender: 'Men', price: 1999, color: '#E5E7EB' },
      { sub: 'Leather Pants', name: 'Faux Leather Slim Moto Pants', gender: 'Women', price: 2499, color: '#18181B', dir: 'women/jeans' },
      { sub: 'Utility Pants', name: 'Reinforced Knee Workwear Utility Pants', gender: 'Men', price: 1999, color: '#365314' },
      { sub: 'Parachute Pants', name: 'Technical Baggy Parachute Pants', gender: 'Unisex', price: 1899, color: '#1E293B' },
      { sub: 'Dhoti Pants', name: 'Pre-Draped Silk Blend Dhoti Pants', gender: 'Men', price: 1499, color: '#FEF3C7', dir: 'men/ethnic' },
      { sub: 'Harem Pants', name: 'Drop-Crotch Bohemian Harem Pants', gender: 'Unisex', price: 1199, color: '#0D9488' },
      { sub: 'Maternity Pants', name: 'Over-the-Bump Stretch Maternity Pants', gender: 'Women', price: 1599, color: '#334155', dir: 'women/jeans' }
    ]
  },
  {
    group: 'Shorts',
    category: 'Shorts',
    dir: 'men/trousers',
    archetype: 'shorts',
    items: [
      { sub: 'Casual Shorts', name: 'Cotton Twill Weekend Casual Shorts', gender: 'Men', price: 999, color: '#3B82F6' },
      { sub: 'Denim Shorts', name: 'Frayed Hem 5-Pocket Denim Shorts', gender: 'Men', price: 1199, color: '#2563EB' },
      { sub: 'Cargo Shorts', name: 'Rugged Ripstop Cargo Shorts', gender: 'Men', price: 1299, color: '#4D7C0F' },
      { sub: 'Bermuda Shorts', name: 'Tailored Knee-Length Bermuda Shorts', gender: 'Men', price: 1199, color: '#D97706' },
      { sub: 'Athletic Shorts', name: 'Quick-Dry Athletic Mesh Shorts', gender: 'Unisex', price: 799, color: '#1E293B', dir: 'sports' },
      { sub: 'Gym Shorts', name: '2-in-1 Compression Liner Gym Shorts', gender: 'Men', price: 999, color: '#18181B', dir: 'sports' },
      { sub: 'Running Shorts', name: 'Split Hem Ultra-Light Running Shorts', gender: 'Unisex', price: 899, color: '#DC2626', dir: 'sports' },
      { sub: 'Basketball Shorts', name: 'Loose Fit Striped Basketball Shorts', gender: 'Men', price: 1099, color: '#7C3AED', dir: 'sports' },
      { sub: 'Cycling Shorts', name: 'Padded Chamois High-Stretch Cycling Shorts', gender: 'Unisex', price: 1299, color: '#18181B', dir: 'sports' },
      { sub: 'Swim Shorts', name: 'Quick-Dry Tropical Print Swim Shorts', gender: 'Men', price: 999, color: '#06B6D4', dir: 'swimwear' },
      { sub: 'Board Shorts', name: 'Tie-Front Surfer Board Shorts', gender: 'Men', price: 1199, color: '#0284C7', dir: 'swimwear' },
      { sub: 'High-Waist Shorts', name: 'Paperbag Belted High-Waist Shorts', gender: 'Women', price: 999, color: '#F472B6', dir: 'women/tops' },
      { sub: 'Hot Pants', name: 'Retro Denim Stretch Hot Pants', gender: 'Women', price: 899, color: '#2563EB', dir: 'women/jeans' },
      { sub: 'Lounge Shorts', name: 'Soft Modal Ribbed Lounge Shorts', gender: 'Unisex', price: 799, color: '#64748B', dir: 'sleepwear' }
    ]
  },
  {
    group: 'Skirts',
    category: 'Skirts',
    dir: 'women/skirts',
    archetype: 'skirt',
    items: [
      { sub: 'Mini Skirt', name: 'A-Line Corduroy Mini Skirt', gender: 'Women', price: 1099, color: '#991B1B' },
      { sub: 'Midi Skirt', name: 'Satin Bias Cut Midi Skirt', gender: 'Women', price: 1499, color: '#065F46' },
      { sub: 'Maxi Skirt', name: 'Bohemian Tiered Ruffle Maxi Skirt', gender: 'Women', price: 1699, color: '#D97706' },
      { sub: 'Pencil Skirt', name: 'High-Waist Tailored Pencil Skirt', gender: 'Women', price: 1399, color: '#18181B' },
      { sub: 'A-Line Skirt', name: 'Structured Wool Blend A-Line Skirt', gender: 'Women', price: 1299, color: '#4338CA' },
      { sub: 'Pleated Skirt', name: 'Metallic Accordion Pleated Skirt', gender: 'Women', price: 1599, color: '#CA8A04' },
      { sub: 'Flared Skirt', name: 'Circle Swing Flared Skirt', gender: 'Women', price: 1199, color: '#DB2777' },
      { sub: 'Wrap Skirt', name: 'Linen Tie-Waist Asymmetric Wrap Skirt', gender: 'Women', price: 1299, color: '#C2410C' },
      { sub: 'Denim Skirt', name: 'Front Slit Vintage Denim Maxi Skirt', gender: 'Women', price: 1799, color: '#2563EB' },
      { sub: 'Cargo Skirt', name: 'Technical Utility Cargo Pocket Skirt', gender: 'Women', price: 1499, color: '#365314' },
      { sub: 'Tennis Skirt', name: 'Pleated Athletic Tennis Skirt', gender: 'Women', price: 999, color: '#F8FAFC' },
      { sub: 'Bodycon Skirt', name: 'Ribbed Knit Seamless Bodycon Skirt', gender: 'Women', price: 899, color: '#18181B' },
      { sub: 'Tiered Skirt', name: 'Cotton Poplin Tiered Skirt', gender: 'Women', price: 1399, color: '#0284C7' },
      { sub: 'Asymmetrical Skirt', name: 'Handkerchief Hem Asymmetrical Skirt', gender: 'Women', price: 1499, color: '#7C3AED' },
      { sub: 'Circle Skirt', name: 'Full Flounce 50s Circle Skirt', gender: 'Women', price: 1299, color: '#E11D48' }
    ]
  },
  {
    group: 'Dresses',
    category: 'Dresses',
    dir: 'women/dresses',
    archetype: 'dress',
    items: [
      { sub: 'Mini Dress', name: 'Square Neck A-Line Mini Dress', gender: 'Women', price: 1499, color: '#BE123C' },
      { sub: 'Midi Dress', name: 'Floral Print Chiffon Midi Dress', gender: 'Women', price: 1799, color: '#059669' },
      { sub: 'Maxi Dress', name: 'Tiered Bohemian Resort Maxi Dress', gender: 'Women', price: 2199, color: '#D97706' },
      { sub: 'Bodycon Dress', name: 'Rouched Satin Stretch Bodycon Dress', gender: 'Women', price: 1699, color: '#18181B' },
      { sub: 'A-Line Dress', name: 'Fit and Flare Twill A-Line Dress', gender: 'Women', price: 1599, color: '#4338CA' },
      { sub: 'Wrap Dress', name: 'Surplice Neckline Floral Wrap Dress', gender: 'Women', price: 1799, color: '#B91C1C' },
      { sub: 'Shirt Dress', name: 'Crisp Poplin Button-Down Shirt Dress', gender: 'Women', price: 1899, color: '#38BDF8' },
      { sub: 'Slip Dress', name: 'Cowl Neck Mulberry Silk Slip Dress', gender: 'Women', price: 1999, color: '#FDE68A' },
      { sub: 'Cocktail Dress', name: 'One-Shoulder Drape Cocktail Dress', gender: 'Women', price: 2499, color: '#4C1D95' },
      { sub: 'Evening Dress', name: 'Floor-Length Velvet Evening Gown', gender: 'Women', price: 3499, color: '#064E3B' },
      { sub: 'Party Dress', name: 'Sequined Sparkle Mini Party Dress', gender: 'Women', price: 2299, color: '#CA8A04' },
      { sub: 'Sundress', name: 'Smocked Bodice Linen Sundress', gender: 'Women', price: 1399, color: '#FBBF24' },
      { sub: 'Casual Dress', name: 'T-Shirt Pocket Everyday Casual Dress', gender: 'Women', price: 1199, color: '#334155' },
      { sub: 'Formal Dress', name: 'Structured Sheath Formal Work Dress', gender: 'Women', price: 2199, color: '#0F172A' },
      { sub: 'Halter Dress', name: 'Backless Pleated Halter Dress', gender: 'Women', price: 1999, color: '#E11D48' },
      { sub: 'Off-Shoulder Dress', name: 'Sweetheart Neck Off-Shoulder Dress', gender: 'Women', price: 2099, color: '#9333EA' },
      { sub: 'Strapless Dress', name: 'Bustier Boned Strapless Dress', gender: 'Women', price: 2299, color: '#18181B' },
      { sub: 'Sweater Dress', name: 'Ribbed Cable Knit Turtleneck Sweater Dress', gender: 'Women', price: 2199, color: '#78350F' },
      { sub: 'Denim Dress', name: 'Fitted Western Snap Denim Dress', gender: 'Women', price: 1899, color: '#2563EB' },
      { sub: 'Kaftan Dress', name: 'Printed Silk Georgette Kaftan Dress', gender: 'Women', price: 2399, color: '#0D9488' },
      { sub: 'Babydoll Dress', name: 'Empire Waist Puff Sleeve Babydoll Dress', gender: 'Women', price: 1499, color: '#F472B6' },
      { sub: 'Tea Dress', name: 'Vintage Polka Dot Flounce Tea Dress', gender: 'Women', price: 1699, color: '#BE123C' },
      { sub: 'Wedding Dress', name: 'Chantilly Lace Illusion Wedding Gown', gender: 'Women', price: 8999, color: '#FAF5FF', dir: 'wedding' },
      { sub: 'Bridesmaid Dress', name: 'Chiffon Ruched Bridesmaid Dress', gender: 'Women', price: 2899, color: '#FDA4AF', dir: 'wedding' },
      { sub: 'Prom Dress', name: 'Off-Shoulder Tulle Princess Prom Dress', gender: 'Women', price: 3999, color: '#38BDF8', dir: 'wedding' },
      { sub: 'Maternity Dress', name: 'Empire Cut Flowy Maternity Dress', gender: 'Women', price: 1699, color: '#A7F3D0' }
    ]
  },
  {
    group: 'One-Piece',
    category: 'Co-ords & Jumpsuits',
    dir: 'women/dresses',
    archetype: 'dress',
    items: [
      { sub: 'Jumpsuit', name: 'Wide-Leg Belted Tailored Jumpsuit', gender: 'Women', price: 2299, color: '#1E293B' },
      { sub: 'Playsuit', name: 'Ruffled Floral Summer Playsuit', gender: 'Women', price: 1399, color: '#F43F5E' },
      { sub: 'Romper', name: 'Linen Button-Front Casual Romper', gender: 'Women', price: 1299, color: '#D97706' },
      { sub: 'Dungarees', name: 'Vintage Washed Denim Dungarees', gender: 'Unisex', price: 2199, color: '#2563EB' },
      { sub: 'Overalls', name: 'Heavy Canvas Workwear Overalls', gender: 'Unisex', price: 2399, color: '#78350F' },
      { sub: 'Pinafore', name: 'Corduroy Bib Pinafore Dress', gender: 'Women', price: 1599, color: '#881337' },
      { sub: 'Boilersuit', name: 'Zip-Front Utilitarian Boilersuit', gender: 'Unisex', price: 2599, color: '#334155' },
      { sub: 'Utility Jumpsuit', name: 'Multi-Pocket Belted Utility Jumpsuit', gender: 'Women', price: 2499, color: '#365314' }
    ]
  },
  {
    group: 'Jackets',
    category: 'Jackets',
    dir: 'men/jackets',
    archetype: 'leather_jacket',
    items: [
      { sub: 'Denim Jacket', name: 'Classic Trucker Heavy Denim Jacket', gender: 'Unisex', price: 2499, color: '#2563EB' },
      { sub: 'Leather Jacket', name: 'Full-Grain Biker Leather Jacket', gender: 'Men', price: 4999, color: '#18181B' },
      { sub: 'Bomber Jacket', name: 'Satin Finish MA-1 Flight Bomber Jacket', gender: 'Unisex', price: 2799, color: '#365314' },
      { sub: 'Varsity Jacket', name: 'Wool Melton Leather-Sleeve Varsity Jacket', gender: 'Unisex', price: 3299, color: '#1E3A8A' },
      { sub: 'Puffer Jacket', name: 'Down-Filled Water Repellent Puffer Jacket', gender: 'Unisex', price: 3499, color: '#0F172A' },
      { sub: 'Biker Jacket', name: 'Asymmetrical Studded Biker Jacket', gender: 'Women', price: 4799, color: '#18181B', dir: 'women/jackets' },
      { sub: 'Motorcycle Jacket', name: 'Armored Heavy Riding Jacket', gender: 'Men', price: 5499, color: '#09090B' },
      { sub: 'Suede Jacket', name: 'Goat Suede Trucker Jacket', gender: 'Men', price: 4299, color: '#B45309' },
      { sub: 'Utility Jacket', name: 'Waxed Cotton Field Utility Jacket', gender: 'Men', price: 2999, color: '#3F6212' },
      { sub: 'Field Jacket', name: 'M-65 Tactical Military Field Jacket', gender: 'Men', price: 3199, color: '#4D7C0F' },
      { sub: 'Military Jacket', name: 'Structured Epaulet Military Jacket', gender: 'Men', price: 2899, color: '#1C1917' },
      { sub: 'Quilted Jacket', name: 'Diamond Quilted Heritage Country Jacket', gender: 'Men', price: 2699, color: '#14532D' },
      { sub: 'Cropped Jacket', name: 'Fitted Denim Cropped Jacket', gender: 'Women', price: 1999, color: '#60A5FA', dir: 'women/jackets' },
      { sub: 'Oversized Jacket', name: 'Boxy Vintage Oversized Jacket', gender: 'Unisex', price: 2899, color: '#374151' },
      { sub: 'Track Jacket', name: 'Retro Striped Zip Track Jacket', gender: 'Unisex', price: 1699, color: '#DC2626', dir: 'sports' },
      { sub: 'Fleece Jacket', name: 'High-Pile Sherpa Fleece Jacket', gender: 'Unisex', price: 2399, color: '#FEF3C7' },
      { sub: 'Windbreaker', name: 'Packable Colorblock Windbreaker', gender: 'Unisex', price: 1799, color: '#0284C7', dir: 'sports' },
      { sub: 'Rain Jacket', name: 'Seam-Sealed Waterproof Rain Jacket', gender: 'Unisex', price: 2299, color: '#EAB308' },
      { sub: 'Hooded Jacket', name: 'Technical Storm-Hooded Jacket', gender: 'Men', price: 2799, color: '#1E293B' },
      { sub: 'Shacket', name: 'Heavy Twill Overshirt Shacket', gender: 'Men', price: 1999, color: '#78350F' }
    ]
  },
  {
    group: 'Coats',
    category: 'Jackets',
    dir: 'men/jackets',
    archetype: 'coat',
    items: [
      { sub: 'Overcoat', name: 'Cashmere Blend Single-Breasted Overcoat', gender: 'Men', price: 5999, color: '#1E293B' },
      { sub: 'Trench Coat', name: 'Double-Breasted Heritage Trench Coat', gender: 'Unisex', price: 4999, color: '#D97706' },
      { sub: 'Peacoat', name: 'Heavy Wool Navy Sailor Peacoat', gender: 'Men', price: 4499, color: '#0F172A' },
      { sub: 'Duffle Coat', name: 'Horn Toggle Hooded Duffle Coat', gender: 'Men', price: 4799, color: '#78350F' },
      { sub: 'Chesterfield Coat', name: 'Velvet Collar Tailored Chesterfield', gender: 'Men', price: 6499, color: '#09090B' },
      { sub: 'Parka', name: 'Faux-Fur Trimmed Winter Down Parka', gender: 'Unisex', price: 5499, color: '#14532D' },
      { sub: 'Duster Coat', name: 'Lightweight Flowing Linen Duster Coat', gender: 'Women', price: 2999, color: '#E5E7EB', dir: 'women/jackets' },
      { sub: 'Long Coat', name: 'Belted Floor-Length Wool Long Coat', gender: 'Women', price: 5299, color: '#78350F', dir: 'women/jackets' },
      { sub: 'Wool Coat', name: 'Double-Faced Italian Wool Coat', gender: 'Men', price: 5899, color: '#334155' },
      { sub: 'Raincoat', name: 'Rubberized Waterproof City Raincoat', gender: 'Unisex', price: 2599, color: '#FACC15' },
      { sub: 'Anorak', name: 'Drawstring Kangaroo Hooded Anorak', gender: 'Unisex', price: 2399, color: '#065F46' },
      { sub: 'Cape Coat', name: 'Wool Blend Arm-Slit Cape Coat', gender: 'Women', price: 3499, color: '#881337', dir: 'women/jackets' },
      { sub: 'Wrap Coat', name: 'Tie-Belt Waterfall Collar Wrap Coat', gender: 'Women', price: 4299, color: '#B45309', dir: 'women/jackets' },
      { sub: 'Puffer Coat', name: 'Maxi Full-Length Puffer Quilt Coat', gender: 'Women', price: 4899, color: '#18181B', dir: 'women/jackets' }
    ]
  },
  {
    group: 'Blazers & Suits',
    category: 'Suits & Tailoring',
    dir: 'men/suits',
    archetype: 'blazer_suit',
    items: [
      { sub: 'Blazer', name: 'Structured Classic Wool Blazer', gender: 'Men', price: 3499, color: '#1E293B' },
      { sub: 'Casual Blazer', name: 'Unstructured Cotton Linen Blazer', gender: 'Men', price: 2999, color: '#D97706' },
      { sub: 'Formal Blazer', name: 'Sharp Peak Lapel Formal Blazer', gender: 'Men', price: 3899, color: '#0F172A' },
      { sub: 'Double-Breasted Blazer', name: '6-Button Double-Breasted Naval Blazer', gender: 'Men', price: 4299, color: '#1E3A8A' },
      { sub: 'Single-Breasted Blazer', name: '2-Button Slim Italian Blazer', gender: 'Men', price: 3699, color: '#334155' },
      { sub: 'Suit Jacket', name: 'Super 130s Merino Suit Jacket', gender: 'Men', price: 4499, color: '#18181B' },
      { sub: 'Two-Piece Suit', name: 'Slim-Fit Modern Two-Piece Business Suit', gender: 'Men', price: 6999, color: '#1E293B' },
      { sub: 'Three-Piece Suit', name: 'Regal Vest & Trouser Three-Piece Suit', gender: 'Men', price: 8999, color: '#0F172A' },
      { sub: 'Tuxedo', name: 'Silk Satin Shawl Lapel Midnight Tuxedo', gender: 'Men', price: 7999, color: '#09090B' },
      { sub: 'Dinner Jacket', name: 'Ivory Jacquard Silk Dinner Jacket', gender: 'Men', price: 5499, color: '#FEF3C7' },
      { sub: 'Jodhpuri Suit', name: 'Royal Velvet Bandhgala Jodhpuri Suit', gender: 'Men', price: 8499, color: '#881337', dir: 'men/ethnic' },
      { sub: 'Business Suit', name: 'Executive Pinstripe Charcoal Business Suit', gender: 'Men', price: 7499, color: '#374151' },
      { sub: 'Wedding Suit', name: 'Luxurious Groom Wedding Suit', gender: 'Men', price: 9999, color: '#1E3A8A', dir: 'wedding' },
      { sub: 'Waistcoat', name: 'Tailored 5-Button Formal Waistcoat', gender: 'Men', price: 1699, color: '#475569' },
      { sub: 'Vest', name: 'Sleeveless Puffer Outer Vest', gender: 'Unisex', price: 1899, color: '#18181B' },
      { sub: 'Gilet', name: 'Diamond Quilted Lightweight Gilet', gender: 'Men', price: 1999, color: '#14532D' }
    ]
  },
  {
    group: 'Indian / Ethnic',
    category: 'Traditional Wear',
    dir: 'men/ethnic',
    archetype: 'ethnic',
    items: [
      { sub: 'Saree', name: 'Kanjivaram Pure Silk Zari Saree', gender: 'Women', price: 4999, color: '#B91C1C', dir: 'women/ethnic' },
      { sub: 'Pre-Draped Saree', name: 'Ready-to-Wear Pleated Saree', gender: 'Women', price: 3499, color: '#4338CA', dir: 'women/ethnic' },
      { sub: 'Saree Gown', name: 'Contemporary Fusion Saree Gown', gender: 'Women', price: 4499, color: '#065F46', dir: 'women/ethnic' },
      { sub: 'Saree Blouse', name: 'Hand-Embroidered Maggam Work Blouse', gender: 'Women', price: 1499, color: '#CA8A04', dir: 'women/ethnic' },
      { sub: 'Lehenga', name: 'Grand Kalidar Zari Embroidered Lehenga', gender: 'Women', price: 7999, color: '#BE123C', dir: 'women/ethnic' },
      { sub: 'Lehenga Choli', name: 'Silk Jacquard Festive Lehenga Choli', gender: 'Women', price: 6499, color: '#9333EA', dir: 'women/ethnic' },
      { sub: 'Ghagra Choli', name: 'Mirror-Work Navratri Ghagra Choli', gender: 'Women', price: 4999, color: '#E11D48', dir: 'women/ethnic' },
      { sub: 'Anarkali', name: 'Floor-Length Umbrella Flare Anarkali Suit', gender: 'Women', price: 3899, color: '#047857', dir: 'women/ethnic' },
      { sub: 'Kurta', name: 'Pure Cotton Chikankari Kurta', gender: 'Men', price: 1499, color: '#F8FAFC' },
      { sub: 'Kurti', name: 'A-Line Printed Rayon Daily Kurti', gender: 'Women', price: 899, color: '#0284C7', dir: 'women/ethnic' },
      { sub: 'Kurta Set', name: 'Embroidered Silk Blend Kurta Pant Set', gender: 'Men', price: 2499, color: '#78350F' },
      { sub: 'Salwar Kameez', name: 'Classic Georgette Salwar Kameez', gender: 'Women', price: 2799, color: '#BE123C', dir: 'women/ethnic' },
      { sub: 'Punjabi Suit', name: 'Patiala Gathers Phulkari Punjabi Suit', gender: 'Women', price: 3199, color: '#F59E0B', dir: 'women/ethnic' },
      { sub: 'Churidar', name: 'Cotton Lycra Gathered Churidar', gender: 'Women', price: 699, color: '#B91C1C', dir: 'women/ethnic' },
      { sub: 'Patiala Suit', name: 'Full Flared Heavy Patiala Suit', gender: 'Women', price: 2999, color: '#EC4899', dir: 'women/ethnic' },
      { sub: 'Sharara', name: 'Flared Ruffle Tiered Sharara Set', gender: 'Women', price: 3499, color: '#0D9488', dir: 'women/ethnic' },
      { sub: 'Gharara', name: 'Zardozi Work Knee-Gathers Gharara Suit', gender: 'Women', price: 4299, color: '#4C1D95', dir: 'women/ethnic' },
      { sub: 'Palazzo Suit', name: 'Straight Kurta with Embroidered Palazzo', gender: 'Women', price: 2699, color: '#15803D', dir: 'women/ethnic' },
      { sub: 'Straight Suit', name: 'Chanderi Silk Straight Cut Suit', gender: 'Women', price: 2499, color: '#D97706', dir: 'women/ethnic' },
      { sub: 'Angrakha', name: 'Side-Tie Flared Angrakha Kurta', gender: 'Women', price: 2199, color: '#EA580C', dir: 'women/ethnic' },
      { sub: 'Kaftan', name: 'Embellished Silk Moroccan Kaftan', gender: 'Women', price: 2799, color: '#0891B2', dir: 'women/ethnic' },
      { sub: 'Half Saree', name: 'Traditional South Indian Dhavani Half Saree', gender: 'Women', price: 3699, color: '#CA8A04', dir: 'women/ethnic' },
      { sub: 'Dupatta', name: 'Banarasi Brocade Heavy Zari Dupatta', gender: 'Women', price: 1299, color: '#DC2626', dir: 'women/ethnic' },
      { sub: 'Phulkari Suit', name: 'Handcrafted Amritsari Phulkari Suit', gender: 'Women', price: 3299, color: '#F97316', dir: 'women/ethnic' },
      { sub: 'Bandhani Outfit', name: 'Kutch Tie-Dye Bandhani Georgette Set', gender: 'Women', price: 3499, color: '#B91C1C', dir: 'women/ethnic' },
      { sub: 'Mekhela Chador', name: 'Assam Muga Silk Mekhela Chador', gender: 'Women', price: 5499, color: '#FBBF24', dir: 'women/ethnic' },
      { sub: 'Mundum Neriyathum', name: 'Kasavu Gold Border Mundum Neriyathum', gender: 'Women', price: 2499, color: '#FEF3C7', dir: 'women/ethnic' },
      { sub: 'Kurta Pyjama', name: 'Linen Festive Kurta Pyjama Set', gender: 'Men', price: 1899, color: '#1E3A8A' },
      { sub: 'Pathani Suit', name: 'Rugged Shoulder-Flap Pathani Suit', gender: 'Men', price: 2299, color: '#18181B' },
      { sub: 'Sherwani', name: 'Royal Brocade Embroidered Sherwani', gender: 'Men', price: 6999, color: '#854D0E' },
      { sub: 'Achkan', name: 'Clean Cut High-Neck Royal Achkan', gender: 'Men', price: 5999, color: '#1E293B' },
      { sub: 'Bandhgala', name: 'Velvet Embellished Bandhgala Coat', gender: 'Men', price: 4999, color: '#881337' },
      { sub: 'Nehru Jacket', name: 'Silk Khadi Printed Nehru Jacket', gender: 'Men', price: 1699, color: '#CA8A04' },
      { sub: 'Jodhpuri Suit', name: 'Breeches & Bandhgala Jodhpuri Set', gender: 'Men', price: 6499, color: '#0F172A' },
      { sub: 'Dhoti', name: 'Pure Silk Gold Border Festive Dhoti', gender: 'Men', price: 999, color: '#FEF3C7' },
      { sub: 'Dhoti Kurta', name: 'Ready-to-Wear Silk Dhoti Kurta Set', gender: 'Men', price: 2799, color: '#D97706' },
      { sub: 'Lungi', name: 'Handloom Checked Cotton Lungi', gender: 'Men', price: 499, color: '#1D4ED8' },
      { sub: 'Indo-Western Suit', name: 'Asymmetric Drape Indo-Western Sherwani', gender: 'Men', price: 7499, color: '#18181B' },
      { sub: 'Indo-Western Kurta', name: 'Cowl Drape Indo-Western Kurta', gender: 'Men', price: 2399, color: '#4338CA' },
      { sub: 'Modi Jacket', name: 'Linen Textured Sleeveless Modi Jacket', gender: 'Men', price: 1599, color: '#15803D' }
    ]
  },
  {
    group: 'Sports',
    category: 'Sports & Activewear',
    dir: 'sports',
    archetype: 'tshirt',
    items: [
      { sub: 'Sports T-Shirt', name: 'Breathable Running Sports T-Shirt', gender: 'Unisex', price: 799, color: '#2563EB' },
      { sub: 'Sports Jersey', name: 'Pro Athletic Match Jersey', gender: 'Unisex', price: 1199, color: '#DC2626' },
      { sub: 'Football Jersey', name: 'Championship Football Kit Jersey', gender: 'Men', price: 1299, color: '#1D4ED8' },
      { sub: 'Cricket Jersey', name: 'India Blue Edition Cricket Jersey', gender: 'Men', price: 1299, color: '#0284C7' },
      { sub: 'Basketball Jersey', name: 'Sleeveless Mesh Basketball Jersey', gender: 'Men', price: 1199, color: '#7C3AED' },
      { sub: 'Tennis Shirt', name: 'Aero-Cool Collared Tennis Shirt', gender: 'Men', price: 1099, color: '#F8FAFC' },
      { sub: 'Running Shirt', name: 'Ultralight Sweat-Wicking Running Shirt', gender: 'Unisex', price: 899, color: '#10B981' },
      { sub: 'Gym T-Shirt', name: 'Drop Armhole Muscle Gym T-Shirt', gender: 'Men', price: 749, color: '#18181B' },
      { sub: 'Training T-Shirt', name: 'Dynamic Stretch Cross-Training Tee', gender: 'Unisex', price: 849, color: '#475569' },
      { sub: 'Compression Shirt', name: 'Targeted Core Compression Shirt', gender: 'Men', price: 999, color: '#0F172A' },
      { sub: 'Compression Pants', name: 'Recovery Muscle Compression Tights', gender: 'Unisex', price: 1199, color: '#18181B' },
      { sub: 'Compression Shorts', name: 'Base Layer Compression Spats', gender: 'Unisex', price: 799, color: '#18181B' },
      { sub: 'Gym Shorts', name: 'Side Slit Heavy Weightlifting Shorts', gender: 'Men', price: 899, color: '#334155' },
      { sub: 'Running Shorts', name: 'Split Vent Reflective Running Shorts', gender: 'Unisex', price: 849, color: '#E11D48' },
      { sub: 'Cycling Shorts', name: 'Gel Pad Ergonomic Cycling Shorts', gender: 'Unisex', price: 1399, color: '#0F172A' },
      { sub: 'Cycling Jersey', name: 'Aerodynamic Full-Zip Cycling Jersey', gender: 'Unisex', price: 1599, color: '#F59E0B' },
      { sub: 'Cycling Bib', name: 'Mesh Straps Pro Cycling Bib Shorts', gender: 'Unisex', price: 1899, color: '#18181B' },
      { sub: 'Track Pants', name: 'Side-Stripe Tricot Track Pants', gender: 'Unisex', price: 1299, color: '#1E3A8A' },
      { sub: 'Joggers', name: 'Athletic Ankle-Zip Running Joggers', gender: 'Unisex', price: 1399, color: '#374151' },
      { sub: 'Tracksuit', name: 'Complete Zip Jacket & Track Pants Set', gender: 'Unisex', price: 2799, color: '#1E293B' },
      { sub: 'Sports Bra', name: 'High-Impact Racerback Sports Bra', gender: 'Women', price: 999, color: '#DB2777' },
      { sub: 'Yoga Pants', name: 'High-Waist Butter-Soft Yoga Pants', gender: 'Women', price: 1499, color: '#065F46' },
      { sub: 'Yoga Top', name: 'Criss-Cross Strappy Bamboo Yoga Top', gender: 'Women', price: 899, color: '#A7F3D0' },
      { sub: 'Training Top', name: 'Seamless Ribbed Studio Training Top', gender: 'Women', price: 949, color: '#C084FC' },
      { sub: 'Athletic Leggings', name: 'Squat-Proof Compression Leggings', gender: 'Women', price: 1399, color: '#18181B' },
      { sub: 'Rash Guard', name: 'UPF 50+ Thermal Surfing Rash Guard', gender: 'Unisex', price: 1199, color: '#0284C7' },
      { sub: 'Windbreaker', name: 'Ultralight Storm Shell Windbreaker', gender: 'Unisex', price: 1899, color: '#F97316' },
      { sub: 'Sports Jacket', name: 'Water-Resistant Athletic Running Jacket', gender: 'Unisex', price: 2199, color: '#1E3A8A' }
    ]
  },
  {
    group: 'Swimwear',
    category: 'Swimwear',
    dir: 'swimwear',
    archetype: 'dress',
    items: [
      { sub: 'Bikini', name: 'Ribbed Triangle Halter Bikini Set', gender: 'Women', price: 1299, color: '#F43F5E' },
      { sub: 'One-Piece Swimsuit', name: 'Plunge Back Sculpting One-Piece Swimsuit', gender: 'Women', price: 1699, color: '#0F172A' },
      { sub: 'Two-Piece Swimsuit', name: 'High-Waist Retro Two-Piece Swimsuit', gender: 'Women', price: 1499, color: '#0D9488' },
      { sub: 'Tankini', name: 'Racerback Longline Tankini Set', gender: 'Women', price: 1599, color: '#2563EB' },
      { sub: 'Monokini', name: 'Cutout Waist Designer Monokini', gender: 'Women', price: 1799, color: '#18181B' },
      { sub: 'Swim Dress', name: 'Flared Modest Swim Dress', gender: 'Women', price: 1899, color: '#4338CA' },
      { sub: 'Swim Trunks', name: 'Quick-Dry Drawstring Swim Trunks', gender: 'Men', price: 999, color: '#0284C7' },
      { sub: 'Swim Shorts', name: 'Gradient Sunset Stretch Swim Shorts', gender: 'Men', price: 899, color: '#EA580C' },
      { sub: 'Board Shorts', name: '4-Way Stretch Performance Board Shorts', gender: 'Men', price: 1299, color: '#1E293B' },
      { sub: 'Swim Leggings', name: 'Sun Defense UPF 50+ Swim Tights', gender: 'Women', price: 1199, color: '#18181B' },
      { sub: 'Beach Cover-Up', name: 'Sheer Crochet Lace Beach Cover-Up', gender: 'Women', price: 1199, color: '#FEF3C7' },
      { sub: 'Sarong', name: 'Printed Silk Beach Wrap Sarong', gender: 'Women', price: 699, color: '#06B6D4' }
    ]
  },
  {
    group: 'Sleepwear',
    category: 'Sleepwear',
    dir: 'sleepwear',
    archetype: 'tshirt',
    items: [
      { sub: 'Pajama', name: 'Flannel Checked Comfort Pajama', gender: 'Unisex', price: 899, color: '#991B1B' },
      { sub: 'Pajama Set', name: 'Button-Front Satin Pajama Set', gender: 'Women', price: 1799, color: '#FDF2F8' },
      { sub: 'Nightdress', name: 'Pure Cotton Printed Nightdress', gender: 'Women', price: 899, color: '#FDA4AF' },
      { sub: 'Nightgown', name: 'Vintage Lace Victorian Nightgown', gender: 'Women', price: 1299, color: '#FFFFFF' },
      { sub: 'Nightshirt', name: 'Oversized Boyfriend Nightshirt', gender: 'Women', price: 999, color: '#93C5FD' },
      { sub: 'Sleep T-Shirt', name: 'Breathable Modal Sleep T-Shirt', gender: 'Unisex', price: 599, color: '#64748B' },
      { sub: 'Sleep Shorts', name: 'Drawstring Cotton Boxer Sleep Shorts', gender: 'Unisex', price: 549, color: '#38BDF8' },
      { sub: 'Sleepsuit', name: 'Full-Zip Thermal Fleece Sleepsuit', gender: 'Unisex', price: 1699, color: '#334155' },
      { sub: 'Robe', name: 'Kimono Collar Silk Lounge Robe', gender: 'Women', price: 1999, color: '#881337' },
      { sub: 'Bathrobe', name: 'Plush Turkish Cotton Terry Bathrobe', gender: 'Unisex', price: 2199, color: '#F8FAFC' },
      { sub: 'Lounge Pants', name: 'Waffle Knit Ribbed Lounge Pants', gender: 'Unisex', price: 1199, color: '#78350F' },
      { sub: 'Lounge Shorts', name: 'French Terry Relaxed Lounge Shorts', gender: 'Unisex', price: 799, color: '#475569' },
      { sub: 'Lounge T-Shirt', name: 'Drop-Shoulder Soft Lounge Tee', gender: 'Unisex', price: 699, color: '#E2E8F0' },
      { sub: 'Lounge Set', name: 'Coordinated Cozy Knit Loungewear Set', gender: 'Women', price: 2199, color: '#D4A373' },
      { sub: 'Sweatpants', name: 'Brushed Cotton Fleece Sleep Sweatpants', gender: 'Unisex', price: 1299, color: '#18181B' },
      { sub: 'Loungewear Set', name: 'Cashmere-Touch Relaxed Loungewear Set', gender: 'Unisex', price: 2499, color: '#A8A29E' }
    ]
  },
  {
    group: 'Innerwear',
    category: 'Innerwear',
    dir: 'innerwear',
    archetype: 'tshirt',
    items: [
      { sub: 'Briefs', name: 'Combed Cotton Classic Briefs (Pack of 3)', gender: 'Men', price: 599, color: '#FFFFFF' },
      { sub: 'Boxer Briefs', name: 'MicroModal Anti-Chafing Boxer Briefs', gender: 'Men', price: 699, color: '#18181B' },
      { sub: 'Boxers', name: 'Relaxed Woven Cotton Boxer Shorts', gender: 'Men', price: 549, color: '#2563EB' },
      { sub: 'Trunks', name: 'Low-Rise Seamless Microfiber Trunks', gender: 'Men', price: 649, color: '#0F172A' },
      { sub: 'Undershirt', name: 'Deep V-Neck Invisible Undershirt', gender: 'Men', price: 499, color: '#F8FAFC' },
      { sub: 'Tank Undershirt', name: 'Ribbed Athletic Tank Undershirt', gender: 'Men', price: 449, color: '#FFFFFF' },
      { sub: 'Thermal Innerwear', name: 'Fleece-Lined Winter Thermal Innerwear Set', gender: 'Unisex', price: 1299, color: '#334155' },
      { sub: 'Bra', name: 'Everyday Non-Padded Cotton Bra', gender: 'Women', price: 699, color: '#FDF2F8' },
      { sub: 'Sports Bra', name: 'Wirefree High-Support Sports Bra', gender: 'Women', price: 999, color: '#DB2777' },
      { sub: 'Bralette', name: 'Lace Triangle Wirefree Bralette', gender: 'Women', price: 799, color: '#BE123C' },
      { sub: 'Push-Up Bra', name: 'Plunge Padded Push-Up Bra', gender: 'Women', price: 1099, color: '#18181B' },
      { sub: 'T-Shirt Bra', name: 'Seamless Molded Cup T-Shirt Bra', gender: 'Women', price: 899, color: '#D4A373' },
      { sub: 'Strapless Bra', name: 'Silicone Grip Multiway Strapless Bra', gender: 'Women', price: 1199, color: '#F8FAFC' },
      { sub: 'Camisole', name: 'Pure Cotton Everyday Camisole', gender: 'Women', price: 499, color: '#FFFFFF' },
      { sub: 'Bikini Underwear', name: 'Soft Stretch Cotton Bikini Panties', gender: 'Women', price: 449, color: '#FDA4AF' },
      { sub: 'Boyshorts', name: 'Full Coverage Seamless Boyshorts', gender: 'Women', price: 499, color: '#18181B' },
      { sub: 'Thong', name: 'Zero-VPL Laser-Cut Thong', gender: 'Women', price: 399, color: '#F472B6' },
      { sub: 'Shapewear', name: 'High-Waist Tummy Tucking Shapewear Shorts', gender: 'Women', price: 1299, color: '#B45309' },
      { sub: 'Slip', name: 'Anti-Static Silk Slip Dress Liner', gender: 'Women', price: 799, color: '#FEF3C7' },
      { sub: 'Bodysuit', name: 'Firm Compression Thong Bodysuit', gender: 'Women', price: 1499, color: '#18181B' },
      { sub: 'Waist Trainer', name: 'Steel Boned Latex Waist Trainer Corset', gender: 'Women', price: 1699, color: '#09090B' }
    ]
  },
  {
    group: 'Kids & Baby',
    category: 'Kids',
    dir: 'kids',
    archetype: 'tshirt',
    items: [
      { sub: 'Baby Bodysuit', name: 'Organic Cotton Envelope Baby Bodysuit', gender: 'Kids', price: 499, color: '#FEF08A' },
      { sub: 'Baby Romper', name: 'Snap Button Cute Animal Baby Romper', gender: 'Kids', price: 699, color: '#93C5FD' },
      { sub: 'Baby Onesie', name: 'Warm Footed Fleece Baby Onesie', gender: 'Kids', price: 799, color: '#FBCFE8' },
      { sub: 'Baby Dress', name: 'Floral Ruffle Party Baby Dress', gender: 'Kids', price: 899, color: '#F43F5E' },
      { sub: 'Baby T-Shirt', name: 'Pure Cotton Shoulder-Snap Baby Tee', gender: 'Kids', price: 399, color: '#86EFAC' },
      { sub: 'Baby Shirt', name: 'Mini Collar Linen Baby Shirt', gender: 'Kids', price: 599, color: '#BAE6FD' },
      { sub: 'Baby Pants', name: 'Elastic Waist Ribbed Baby Pants', gender: 'Kids', price: 449, color: '#CBD5E1' },
      { sub: 'Baby Shorts', name: 'Soft Drawstring Cotton Baby Shorts', gender: 'Kids', price: 399, color: '#FDE047' },
      { sub: 'Baby Jeans', name: 'Gentle Stretch Elastic Baby Jeans', gender: 'Kids', price: 699, color: '#3B82F6' },
      { sub: 'Baby Leggings', name: 'Printed Footless Baby Leggings', gender: 'Kids', price: 449, color: '#F472B6' },
      { sub: 'Baby Pajamas', name: 'Two-Piece Snug Fit Baby Pajama Set', gender: 'Kids', price: 699, color: '#93C5FD' },
      { sub: 'Baby Sleepsuit', name: 'Organic Zipped Cotton Baby Sleepsuit', gender: 'Kids', price: 799, color: '#E0E7FF' },
      { sub: 'Kids T-Shirt', name: 'Dino Explorer Graphic Kids T-Shirt', gender: 'Kids', price: 549, color: '#059669' },
      { sub: 'Kids Shirt', name: 'Casual Gingham Check Kids Shirt', gender: 'Kids', price: 799, color: '#1E3A8A' },
      { sub: 'Kids Hoodie', name: 'Fleece Lined Graphic Kids Hoodie', gender: 'Kids', price: 1099, color: '#DC2626' },
      { sub: 'Kids Sweatshirt', name: 'Colorblock Ribbed Kids Sweatshirt', gender: 'Kids', price: 999, color: '#EAB308' },
      { sub: 'Kids Jeans', name: 'Comfort Stretch Straight Kids Jeans', gender: 'Kids', price: 1199, color: '#2563EB' },
      { sub: 'Kids Dress', name: 'Twirl Tulle Sparkle Kids Dress', gender: 'Kids', price: 1299, color: '#EC4899' },
      { sub: 'Kids Skirt', name: 'Pleated Uniform/Casual Kids Skirt', gender: 'Kids', price: 799, color: '#4338CA' },
      { sub: 'Kids Shorts', name: 'Cargo Pocket Cotton Kids Shorts', gender: 'Kids', price: 649, color: '#4D7C0F' },
      { sub: 'Kids Jacket', name: 'Lightweight Hooded Windproof Kids Jacket', gender: 'Kids', price: 1499, color: '#0284C7' },
      { sub: 'Kids Tracksuit', name: 'Athletic Tricot Two-Piece Kids Tracksuit', gender: 'Kids', price: 1699, color: '#1E293B' },
      { sub: 'Kids Sportswear', name: 'Quick-Dry Match Day Kids Sportswear', gender: 'Kids', price: 899, color: '#16A34A' },
      { sub: 'School Uniform', name: 'Smart Tailored School Uniform Set', gender: 'Kids', price: 1299, color: '#1E3A8A' }
    ]
  },
  {
    group: 'Wedding',
    category: 'Traditional Wear',
    dir: 'wedding',
    archetype: 'ethnic',
    items: [
      { sub: 'Wedding Dress', name: 'Couture Hand-Beaded Royal Wedding Gown', gender: 'Women', price: 14999, color: '#FAF5FF' },
      { sub: 'Bridal Lehenga', name: 'Maharani Heritage Velvet Bridal Lehenga', gender: 'Women', price: 18999, color: '#991B1B' },
      { sub: 'Bridal Saree', name: 'Pure Kanchipuram Real Gold Zari Bridal Saree', gender: 'Women', price: 12999, color: '#B91C1C' },
      { sub: 'Bridal Blouse', name: 'Intricate Zardozi & Pearl Embroidered Blouse', gender: 'Women', price: 3499, color: '#CA8A04' },
      { sub: 'Bridesmaid Dress', name: 'Chiffon Sweetheart Floor-Length Gown', gender: 'Women', price: 3999, color: '#FDA4AF' },
      { sub: 'Reception Dress', name: 'Shimmering Metallic Evening Reception Dress', gender: 'Women', price: 6999, color: '#4338CA' },
      { sub: 'Engagement Dress', name: 'Pastel Floral Corset Engagement Gown', gender: 'Women', price: 5999, color: '#F472B6' },
      { sub: 'Cocktail Dress', name: 'Draped Satin Cocktail Sangeet Dress', gender: 'Women', price: 4499, color: '#065F46' },
      { sub: 'Evening Gown', name: 'Crystal Embellished Mermaid Evening Gown', gender: 'Women', price: 8499, color: '#0F172A' },
      { sub: 'Prom Dress', name: 'Princess Cut Ball Gown Prom Dress', gender: 'Women', price: 4999, color: '#8B5CF6' },
      { sub: 'Party Dress', name: 'Satin Halter Slip Party Dress', gender: 'Women', price: 2999, color: '#BE123C' },
      { sub: 'Formal Gown', name: 'Architectural Pleat Column Formal Gown', gender: 'Women', price: 5499, color: '#18181B' },
      { sub: 'Sherwani', name: 'Groom Hand-Embroidered Zardozi Sherwani', gender: 'Men', price: 12999, color: '#FEF3C7' },
      { sub: 'Wedding Kurta', name: 'Silk Jacquard Embroidered Wedding Kurta', gender: 'Men', price: 3999, color: '#D97706' },
      { sub: 'Wedding Suit', name: 'Italian Wool Three-Piece Wedding Suit', gender: 'Men', price: 9999, color: '#1E3A8A' },
      { sub: 'Tuxedo', name: 'Groom Satin Peak Lapel Midnight Tuxedo', gender: 'Men', price: 8999, color: '#09090B' },
      { sub: 'Three-Piece Suit', name: 'Double-Breasted Vest Royal Wedding Suit', gender: 'Men', price: 10499, color: '#1E293B' },
      { sub: 'Jodhpuri Suit', name: 'Embroidered Velvet Royal Jodhpuri Bandhgala', gender: 'Men', price: 9499, color: '#881337' }
    ]
  },
  {
    group: 'Footwear',
    category: 'Footwear',
    dir: 'footwear',
    archetype: 'footwear',
    items: [
      { sub: 'Sneakers', name: 'Retro Leather Court Sneakers', gender: 'Unisex', price: 2499, color: '#F8FAFC' },
      { sub: 'Running Shoes', name: 'Pro Nitrogen Cushion Running Shoes', gender: 'Unisex', price: 3499, color: '#38BDF8' },
      { sub: 'Walking Shoes', name: 'Ultra-Light Slip-On Walking Shoes', gender: 'Unisex', price: 1899, color: '#64748B' },
      { sub: 'Training Shoes', name: 'CrossFit Flat Stability Training Shoes', gender: 'Unisex', price: 2999, color: '#18181B' },
      { sub: 'Basketball Shoes', name: 'High-Ankle Ankle Lock Basketball Shoes', gender: 'Men', price: 3999, color: '#DC2626' },
      { sub: 'Tennis Shoes', name: 'Clay & Hard Court Pivot Tennis Shoes', gender: 'Unisex', price: 2799, color: '#10B981' },
      { sub: 'Skate Shoes', name: 'Vulcanized Suede Grip Skate Shoes', gender: 'Unisex', price: 2299, color: '#374151' },
      { sub: 'High-Top Sneakers', name: 'Vintage Canvas High-Top Sneakers', gender: 'Unisex', price: 2199, color: '#18181B' },
      { sub: 'Low-Top Sneakers', name: 'Minimalist Clean Low-Top Sneakers', gender: 'Unisex', price: 1999, color: '#FFFFFF' },
      { sub: 'Slip-On Sneakers', name: 'Twin-Gore Elastic Slip-On Sneakers', gender: 'Unisex', price: 1699, color: '#0F172A' },
      { sub: 'Oxford Shoes', name: 'Hand-Burnished Cap Toe Oxford Shoes', gender: 'Men', price: 3999, color: '#451A03' },
      { sub: 'Derby Shoes', name: 'Open Lacing Leather Dress Derby Shoes', gender: 'Men', price: 3499, color: '#18181B' },
      { sub: 'Loafers', name: 'Penny Leather Slip-On Loafers', gender: 'Men', price: 2999, color: '#78350F' },
      { sub: 'Monk Strap Shoes', name: 'Double Buckle Monk Strap Leather Shoes', gender: 'Men', price: 3799, color: '#B45309' },
      { sub: 'Brogues', name: 'Wingtip Perforated Leather Brogues', gender: 'Men', price: 3899, color: '#451A03' },
      { sub: 'Chelsea Boots', name: 'Full-Grain Elastic Gusset Chelsea Boots', gender: 'Unisex', price: 4299, color: '#18181B' },
      { sub: 'Chukka Boots', name: 'Desert Suede 3-Eyelet Chukka Boots', gender: 'Men', price: 3199, color: '#D97706' },
      { sub: 'Combat Boots', name: 'Lug Sole Military Combat Boots', gender: 'Unisex', price: 3999, color: '#09090B' },
      { sub: 'Hiking Boots', name: 'Waterproof Vibram Trail Hiking Boots', gender: 'Unisex', price: 4999, color: '#78350F' },
      { sub: 'Work Boots', name: 'Steel Toe Oil-Resistant Work Boots', gender: 'Men', price: 3699, color: '#B45309' },
      { sub: 'Ankle Boots', name: 'Block Heel Pointed Ankle Boots', gender: 'Women', price: 2899, color: '#18181B' },
      { sub: 'Knee-High Boots', name: 'Riding Style Leather Knee-High Boots', gender: 'Women', price: 4599, color: '#451A03' },
      { sub: 'Thigh-High Boots', name: 'Stretch Suede Over-The-Knee Boots', gender: 'Women', price: 5299, color: '#18181B' },
      { sub: 'Sandals', name: 'Ergonomic Cork Footbed Leather Sandals', gender: 'Unisex', price: 1699, color: '#B45309' },
      { sub: 'Flip-Flops', name: 'Comfort Cushion Beach Flip-Flops', gender: 'Unisex', price: 599, color: '#0284C7' },
      { sub: 'Slides', name: 'Molded Foam Pool Slides', gender: 'Unisex', price: 899, color: '#18181B' },
      { sub: 'Mules', name: 'Backless Leather Heeled Mules', gender: 'Women', price: 2199, color: '#FEF3C7' },
      { sub: 'Clogs', name: 'Ventilated Waterproof Comfort Clogs', gender: 'Unisex', price: 1299, color: '#334155' },
      { sub: 'Espadrilles', name: 'Jute Braid Sole Canvas Espadrilles', gender: 'Unisex', price: 1499, color: '#E5E7EB' },
      { sub: 'Moccasins', name: 'Driving Pebble Sole Soft Moccasins', gender: 'Men', price: 2499, color: '#78350F' },
      { sub: 'Jutti', name: 'Royal Punjabi Embroidered Velvet Jutti', gender: 'Unisex', price: 1899, color: '#BE123C' }
    ]
  },
  {
    group: 'Headwear',
    category: 'Accessories',
    dir: 'headwear',
    archetype: 'headwear',
    items: [
      { sub: 'Baseball Cap', name: '6-Panel Curved Brim Baseball Cap', gender: 'Unisex', price: 699, color: '#18181B' },
      { sub: 'Snapback', name: 'Flat Brim Embroidered Snapback Cap', gender: 'Unisex', price: 799, color: '#1E3A8A' },
      { sub: 'Trucker Cap', name: 'Breathable Mesh Back Trucker Cap', gender: 'Unisex', price: 649, color: '#374151' },
      { sub: 'Bucket Hat', name: 'Reversible Cotton Washed Bucket Hat', gender: 'Unisex', price: 799, color: '#4D7C0F' },
      { sub: 'Beanie', name: 'Ribbed Knit Fold-Over Winter Beanie', gender: 'Unisex', price: 599, color: '#78350F' },
      { sub: 'Fedora', name: 'Wool Felt Pinched Crown Fedora Hat', gender: 'Unisex', price: 1499, color: '#18181B' },
      { sub: 'Panama Hat', name: 'Toquilla Straw Wide Brim Panama Hat', gender: 'Unisex', price: 1699, color: '#FEF3C7' },
      { sub: 'Beret', name: 'French Wool Classic Artist Beret', gender: 'Women', price: 899, color: '#881337' },
      { sub: 'Sun Hat', name: 'Packable UV Wide Floppy Sun Hat', gender: 'Women', price: 999, color: '#FDE68A' },
      { sub: 'Visor', name: 'Athletic Open-Top Tennis Visor', gender: 'Unisex', price: 499, color: '#F8FAFC' },
      { sub: 'Turban', name: 'Pre-Tied Royal Silk Festive Turban', gender: 'Men', price: 1499, color: '#F59E0B' }
    ]
  },
  {
    group: 'Bags',
    category: 'Accessories',
    dir: 'bags',
    archetype: 'bag',
    items: [
      { sub: 'Backpack', name: 'Water-Resistant Daily City Backpack', gender: 'Unisex', price: 1999, color: '#1E293B' },
      { sub: 'Laptop Backpack', name: 'Padded Compartment Tech Laptop Backpack', gender: 'Unisex', price: 2499, color: '#0F172A' },
      { sub: 'Handbag', name: 'Structured Saffiano Leather Handbag', gender: 'Women', price: 2999, color: '#881337' },
      { sub: 'Tote Bag', name: 'Heavy Canvas Stitched Shopper Tote', gender: 'Unisex', price: 1299, color: '#E5E7EB' },
      { sub: 'Shoulder Bag', name: '90s Baguette Leather Shoulder Bag', gender: 'Women', price: 1899, color: '#18181B' },
      { sub: 'Crossbody Bag', name: 'Adjustable Strap Compact Crossbody Bag', gender: 'Unisex', price: 1499, color: '#B45309' },
      { sub: 'Sling Bag', name: 'Tactical One-Strap Chest Sling Bag', gender: 'Unisex', price: 1399, color: '#334155' },
      { sub: 'Clutch', name: 'Envelope Evening Metallic Clutch', gender: 'Women', price: 1199, color: '#CA8A04' },
      { sub: 'Waist Bag', name: 'Nylon Travel Utility Waist Bag', gender: 'Unisex', price: 899, color: '#18181B' },
      { sub: 'Fanny Pack', name: 'Retro Streetwear Zip Fanny Pack', gender: 'Unisex', price: 799, color: '#0284C7' },
      { sub: 'Messenger Bag', name: 'Waxed Canvas Flap Messenger Bag', gender: 'Men', price: 2299, color: '#78350F' },
      { sub: 'Laptop Bag', name: 'Slim Briefcase Padded Laptop Bag', gender: 'Unisex', price: 1899, color: '#1E293B' },
      { sub: 'Duffel Bag', name: 'Barrel Gym & Travel Duffel Bag', gender: 'Unisex', price: 1999, color: '#0F172A' },
      { sub: 'Gym Bag', name: 'Shoe Compartment Ventilated Gym Bag', gender: 'Unisex', price: 1699, color: '#DC2626' },
      { sub: 'Travel Bag', name: 'Weekender Water-Repellent Travel Bag', gender: 'Unisex', price: 2899, color: '#475569' },
      { sub: 'Bucket Bag', name: 'Drawstring Leather Slouch Bucket Bag', gender: 'Women', price: 2199, color: '#D97706' },
      { sub: 'Mini Bag', name: 'Micro Chain Strap Accent Mini Bag', gender: 'Women', price: 1299, color: '#F472B6' },
      { sub: 'Satchel', name: 'Twin Buckle Vintage Leather Satchel', gender: 'Unisex', price: 2699, color: '#451A03' }
    ]
  },
  {
    group: 'Accessories',
    category: 'Accessories',
    dir: 'accessories',
    archetype: 'accessory',
    items: [
      { sub: 'Belt', name: 'Full-Grain Italian Leather Pin-Buckle Belt', gender: 'Men', price: 999, color: '#18181B' },
      { sub: 'Wallet', name: 'RFID Protected Bi-Fold Leather Wallet', gender: 'Men', price: 899, color: '#451A03' },
      { sub: 'Tie', name: 'Jacquard Silk Geometric Pattern Tie', gender: 'Men', price: 799, color: '#991B1B' },
      { sub: 'Bow Tie', name: 'Silk Satin Pre-Tied Formal Bow Tie', gender: 'Men', price: 699, color: '#09090B' },
      { sub: 'Pocket Square', name: 'Hand-Rolled Hem Silk Pocket Square', gender: 'Men', price: 499, color: '#FFFFFF' },
      { sub: 'Scarf', name: 'Cashmere Feel Plaid Winter Scarf', gender: 'Unisex', price: 999, color: '#78350F' },
      { sub: 'Shawl', name: 'Pure Pashmina Hand-Woven Kashmiri Shawl', gender: 'Unisex', price: 3499, color: '#D4A373' },
      { sub: 'Stole', name: 'Silk Modal Digitally Printed Stole', gender: 'Women', price: 899, color: '#065F46' },
      { sub: 'Gloves', name: 'Touchscreen Compatible Leather Gloves', gender: 'Unisex', price: 1199, color: '#18181B' },
      { sub: 'Socks', name: 'Combed Cotton Cushion Crew Socks (3-Pack)', gender: 'Unisex', price: 399, color: '#FFFFFF' },
      { sub: 'Ankle Socks', name: 'No-Show Low Cut Athletic Ankle Socks', gender: 'Unisex', price: 349, color: '#1E293B' },
      { sub: 'Crew Socks', name: 'Ribbed Retro Athletic Crew Socks', gender: 'Unisex', price: 399, color: '#FFFFFF' },
      { sub: 'Knee-High Socks', name: 'Knit Thermal Knee-High Socks', gender: 'Women', price: 499, color: '#374151' },
      { sub: 'Stockings', name: 'Semi-Opaque Sheer Matte Stockings', gender: 'Women', price: 449, color: '#09090B' },
      { sub: 'Tights', name: 'Fleece Lined Opaque Winter Tights', gender: 'Women', price: 699, color: '#18181B' },
      { sub: 'Leg Warmers', name: 'Ribbed Ballet Knit Leg Warmers', gender: 'Women', price: 499, color: '#CBD5E1' },
      { sub: 'Suspenders', name: 'Y-Back Elastic Leather Clip Suspenders', gender: 'Men', price: 799, color: '#18181B' },
      { sub: 'Sunglasses', name: 'Polarized UV400 Acetate Sunglasses', gender: 'Unisex', price: 1499, color: '#09090B' },
      { sub: 'Watch', name: 'Chronograph Minimalist Leather Watch', gender: 'Unisex', price: 2999, color: '#1E293B' },
      { sub: 'Cufflinks', name: 'Mother of Pearl Brass Cufflinks', gender: 'Men', price: 899, color: '#E2E8F0' },
      { sub: 'Tie Clip', name: 'Brushed Silver Formal Tie Bar', gender: 'Men', price: 499, color: '#CBD5E1' },
      { sub: 'Brooch', name: 'Kundan Stone Imperial Sherwani Brooch', gender: 'Unisex', price: 999, color: '#CA8A04' },
      { sub: 'Hair Band', name: 'Padded Velvet Embellished Hair Band', gender: 'Women', price: 399, color: '#881337' },
      { sub: 'Scrunchie', name: 'Mulberry Silk Anti-Frizz Scrunchie', gender: 'Women', price: 299, color: '#F472B6' }
    ]
  },
  {
    group: 'Cultural Fashion',
    category: 'Traditional Wear',
    dir: 'cultural',
    archetype: 'cultural',
    items: [
      { sub: 'Kimono', name: 'Traditional Floral Silk Japanese Kimono', gender: 'Women', price: 4999, color: '#BE123C' },
      { sub: 'Yukata', name: 'Summer Cotton Unlined Yukata Robe', gender: 'Women', price: 2999, color: '#1D4ED8' },
      { sub: 'Qipao', name: 'Tailored Mandarin Collar Silk Qipao', gender: 'Women', price: 3499, color: '#B91C1C' },
      { sub: 'Hanbok', name: 'Jeogori & Chima Traditional Korean Hanbok', gender: 'Women', price: 5499, color: '#EC4899' },
      { sub: 'Dashiki', name: 'Vibrant Print African Heritage Dashiki', gender: 'Unisex', price: 1899, color: '#F59E0B' },
      { sub: 'Kaftan', name: 'Gold Embroidered Dubai Royal Kaftan', gender: 'Women', price: 3999, color: '#047857' },
      { sub: 'Kilt', name: 'Highland Tartan Pure Wool Scottish Kilt', gender: 'Men', price: 3499, color: '#15803D' },
      { sub: 'Fustanella', name: 'Pleated Heritage Balkan Fustanella Skirt', gender: 'Men', price: 2799, color: '#F8FAFC' },
      { sub: 'Poncho', name: 'Geometric Woven Andean Wool Poncho', gender: 'Unisex', price: 2299, color: '#B45309' },
      { sub: 'Sarong', name: 'Hand-Batik Balinese Cotton Sarong', gender: 'Unisex', price: 899, color: '#0891B2' },
      { sub: 'Dirndl', name: 'Bavarian Embroidered Alpine Dirndl Dress', gender: 'Women', price: 4499, color: '#881337' },
      { sub: 'Lederhosen', name: 'Genuine Leather Embroidered Lederhosen', gender: 'Men', price: 5299, color: '#451A03' },
      { sub: 'Cheongsam', name: 'Side-Slit Floral Brocade Cheongsam', gender: 'Women', price: 3299, color: '#991B1B' },
      { sub: 'Abaya', name: 'Flowing Crepe Embroidered Cuff Abaya', gender: 'Women', price: 3199, color: '#09090B' },
      { sub: 'Thobe', name: 'Crisp White Gulf Traditional Men Thobe', gender: 'Men', price: 2499, color: '#FFFFFF' },
      { sub: 'Kandura', name: 'Emirati Minimalist Clean Line Kandura', gender: 'Men', price: 2699, color: '#F8FAFC' },
      { sub: 'Jalabiya', name: 'Zari Embroidered Festive Jalabiya', gender: 'Women', price: 2899, color: '#7C3AED' },
      { sub: 'Boubou', name: 'Senegalese Grand Silk Bazin Boubou', gender: 'Unisex', price: 4299, color: '#CA8A04' }
    ]
  }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getSvgForArchetype(archetype, options) {
  switch (archetype) {
    case 'tshirt':
      return renderTShirtSvg(options);
    case 'polo':
      return renderPoloSvg(options);
    case 'shirt':
      return renderShirtSvg(options);
    case 'hoodie':
      return renderHoodieSvg(options);
    case 'jeans':
      return renderJeansSvg(options);
    case 'pants':
      return renderPantsSvg(options);
    case 'shorts':
      return renderShortsSvg(options);
    case 'skirt':
      return renderSkirtSvg(options);
    case 'dress':
      return renderDressSvg(options);
    case 'leather_jacket':
      return renderLeatherJacketSvg(options);
    case 'blazer_suit':
      return renderBlazerSuitSvg(options);
    case 'coat':
      return renderCoatSvg(options);
    case 'ethnic':
      return renderEthnicSvg(options);
    case 'footwear':
      return renderFootwearSvg(options);
    case 'headwear':
      return renderHeadwearSvg(options);
    case 'bag':
      return renderBagSvg(options);
    case 'accessory':
      return renderAccessorySvg(options);
    case 'cultural':
      return renderCulturalSvg(options);
    default:
      return renderTShirtSvg(options);
  }
}

const COLOR_PALETTE_MAP = {
  Black: '#18181B',
  White: '#F8FAFC',
  Navy: '#1E3A8A',
  Olive: '#3F6212',
  Maroon: '#881337',
  Beige: '#D4A373',
  Grey: '#4B5563',
  Blue: '#2563EB',
  Red: '#DC2626',
  Green: '#15803D'
};

async function buildAll() {
  console.log('🚀 Starting FitFusion Complete Fashion Catalog & Image Generator...');

  const basePublicDir = path.resolve('public/images/products');
  fs.mkdirSync(basePublicDir, { recursive: true });

  const completeCatalog = [];
  let generatedImagesCount = 0;

  for (const catGroup of ALL_CATEGORIES) {
    console.log(`\n📂 Processing Category Group: ${catGroup.group} (${catGroup.items.length} items)...`);

    for (const item of catGroup.items) {
      const relDir = item.dir || catGroup.dir;
      const targetFolder = path.join(basePublicDir, relDir);
      fs.mkdirSync(targetFolder, { recursive: true });

      const slug = slugify(item.name);
      const id = `${item.gender.toLowerCase()}-${slug}`;

      // Image paths
      const primaryImagePath = `/images/products/${relDir}/${slug}.webp`;
      const backImagePath = `/images/products/${relDir}/${slug}_back.webp`;
      const sideImagePath = `/images/products/${relDir}/${slug}_side.webp`;
      const detailImagePath = `/images/products/${relDir}/${slug}_detail.webp`;

      // 1. Generate Front / Primary WebP
      const frontSvg = wrapInStudio({
        content: getSvgForArchetype(catGroup.archetype, {
          color: item.color,
          accentColor: '#CA8A04',
          subcategory: item.sub,
          view: 'front'
        }),
        label: `FITFUSION • ${item.sub}`
      });

      const frontFilePath = path.join(targetFolder, `${slug}.webp`);
      await sharp(Buffer.from(frontSvg)).webp({ quality: 88 }).toFile(frontFilePath);
      generatedImagesCount++;

      // 2. Generate Multi-angle Views (Back, Side, Detail)
      const backSvg = wrapInStudio({
        content: getSvgForArchetype(catGroup.archetype, {
          color: item.color,
          accentColor: '#CA8A04',
          subcategory: item.sub,
          view: 'back'
        }),
        label: `FITFUSION • ${item.sub} (BACK)`
      });
      await sharp(Buffer.from(backSvg)).webp({ quality: 88 }).toFile(path.join(targetFolder, `${slug}_back.webp`));
      generatedImagesCount++;

      const sideSvg = wrapInStudio({
        content: getSvgForArchetype(catGroup.archetype, {
          color: item.color,
          accentColor: '#38BDF8',
          subcategory: item.sub,
          view: 'side'
        }),
        label: `FITFUSION • ${item.sub} (SIDE)`
      });
      await sharp(Buffer.from(sideSvg)).webp({ quality: 88 }).toFile(path.join(targetFolder, `${slug}_side.webp`));
      generatedImagesCount++;

      const detailSvg = wrapInStudio({
        content: getSvgForArchetype(catGroup.archetype, {
          color: item.color,
          accentColor: '#CA8A04',
          subcategory: item.sub,
          view: 'detail'
        }),
        label: `FITFUSION • ${item.sub} (DETAILS)`
      });
      await sharp(Buffer.from(detailSvg)).webp({ quality: 88 }).toFile(path.join(targetFolder, `${slug}_detail.webp`));
      generatedImagesCount++;

      // 3. Generate Color Variants
      const variantColors = [
        { name: 'Black', hex: '#18181B' },
        { name: 'White', hex: '#F8FAFC' },
        { name: 'Navy', hex: '#1E3A8A' },
        { name: 'Olive', hex: '#3F6212' },
        { name: 'Maroon', hex: '#881337' }
      ];

      const colorImagesMap = {};
      colorImagesMap['Standard'] = primaryImagePath;

      for (const vc of variantColors) {
        const variantSvg = wrapInStudio({
          content: getSvgForArchetype(catGroup.archetype, {
            color: vc.hex,
            accentColor: '#F59E0B',
            subcategory: item.sub,
            view: 'front'
          }),
          label: `FITFUSION • ${item.sub} (${vc.name})`
        });
        const colorSlug = vc.name.toLowerCase();
        const colorFileName = `${slug}_${colorSlug}.webp`;
        await sharp(Buffer.from(variantSvg)).webp({ quality: 88 }).toFile(path.join(targetFolder, colorFileName));
        colorImagesMap[vc.name] = `/images/products/${relDir}/${colorFileName}`;
        generatedImagesCount++;
      }

      // Build product metadata entry
      const comparePrice = Math.round(item.price * 1.35 / 50) * 50 - 1;
      const productObj = {
        id: id,
        name: item.name,
        slug: slug,
        category: catGroup.category,
        subcategory: item.sub,
        group: catGroup.group,
        gender: item.gender,
        basePrice: item.price,
        compareAtPrice: comparePrice,
        currency: 'INR',
        rating: +(4.6 + (Math.random() * 0.35)).toFixed(1),
        reviewsCount: Math.floor(40 + Math.random() * 180),
        badge: item.price > 4000 ? 'Luxury' : (Math.random() > 0.6 ? 'Trending' : 'Bestseller'),
        featured: Math.random() > 0.8,
        trending: Math.random() > 0.65,
        recommended: true,
        available: true,
        stock: Math.floor(15 + Math.random() * 45),
        lowStockThreshold: 5,
        stockStatus: 'In Stock',
        customizationEnabled: true,
        shortDescription: `Artisanal tailored ${item.sub.toLowerCase()} engineered with premium textiles and precise fit.`,
        description: `Part of FitFusion's master wardrobe collection. The ${item.name} combines precision cutting, reinforced construction, and breathable handfeel. Designed for supreme daily wear, versatile styling, and personalized 3D customization.`,
        image: primaryImagePath,
        images: [primaryImagePath, backImagePath, sideImagePath, detailImagePath],
        colorImages: colorImagesMap,
        thumbnail: primaryImagePath,
        availableFabrics: [
          { name: '100% Combed Cotton', composition: 'Ultra-soft combed yarn' },
          { name: 'Merino & Linen Blend', composition: 'Breathable seasonal weave' },
          { name: 'Performance Microfiber', composition: 'Moisture wicking with shape retention' }
        ],
        availableColors: variantColors,
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', 'Custom Measurement'],
        occasion: ['Casual', 'Weekend', 'Occasion', 'Daily'],
        season: ['All Season', 'Summer', 'Winter'],
        style: 'Modern Classic',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      completeCatalog.push(productObj);
    }
  }

  console.log(`\n✅ Generated total ${generatedImagesCount} WebP images!`);
  console.log(`✅ Built ${completeCatalog.length} fashion products across all 24 categories!`);

  // Write catalog data module
  const catalogFilePath = path.resolve('src/data/completeFashionCatalog.js');
  const catalogCode = `/**
 * FITFUSION COMPLETE 450+ FASHION CATALOG
 * Auto-generated with exact localized thumbnails and multi-view angles.
 */

export const COMPLETE_FASHION_CATALOG = ${JSON.stringify(completeCatalog, null, 2)};
`;

  fs.writeFileSync(catalogFilePath, catalogCode, 'utf8');
  console.log(`✅ Saved catalog data to ${catalogFilePath}`);
}

buildAll().catch(err => {
  console.error('Error during catalog generation:', err);
  process.exit(1);
});
