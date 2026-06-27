import { useState, useEffect, useCallback, useMemo } from "react";

// ── PointsVault Library — hardcoded master data ───────────────────────────────
const LIBRARY = {
  // ── Loyalty Programs ─────────────────────────────────────────────────────
  programs: [
    // Airlines — Star Alliance
    {lid:"lp_krisflyer",    name:"Singapore Airlines KrisFlyer",    category:"Airline", points_currency:"KrisFlyer Miles",    inr_per_point:1.50, expiry_rule:"Miles expire after 36 months of account inactivity"},
    {lid:"lp_airindia",     name:"Air India Flying Returns",         category:"Airline", points_currency:"Miles",              inr_per_point:0.70, expiry_rule:"Miles expire 36 months from date of earning"},
    {lid:"lp_united",       name:"United MileagePlus",               category:"Airline", points_currency:"Miles",              inr_per_point:1.20, expiry_rule:"Miles never expire with account activity"},
    {lid:"lp_aeroplan",     name:"Air Canada Aeroplan",              category:"Airline", points_currency:"Points",             inr_per_point:1.40, expiry_rule:"Points expire after 18 months of inactivity"},
    {lid:"lp_turkish",      name:"Turkish Airlines Miles and Smiles", category:"Airline", points_currency:"Miles",              inr_per_point:1.00, expiry_rule:"Miles expire 3 years from date of earning"},
    {lid:"lp_thai",         name:"Thai Airways Royal Orchid Plus",   category:"Airline", points_currency:"Miles",              inr_per_point:0.90, expiry_rule:"Miles expire 3 years from date of earning"},
    {lid:"lp_ethiopian",    name:"Ethiopian Airlines ShebaMiles",    category:"Airline", points_currency:"Miles",              inr_per_point:0.80, expiry_rule:"Miles expire 3 years from date of earning"},
    {lid:"lp_lifemiles",    name:"Avianca LifeMiles",                category:"Airline", points_currency:"Miles",              inr_per_point:1.00, expiry_rule:"Miles expire after 12 months of inactivity"},
    {lid:"lp_ana",          name:"ANA Mileage Club",                 category:"Airline", points_currency:"Miles",              inr_per_point:1.50, expiry_rule:"Miles expire 36 months from date of earning"},
    {lid:"lp_lufthansa",    name:"Lufthansa Miles and More",         category:"Airline", points_currency:"Miles",              inr_per_point:1.00, expiry_rule:"Miles expire 36 months from date of earning. Covers SWISS, Austrian, Brussels Airlines"},
    // Airlines — Oneworld
    {lid:"lp_ba",           name:"British Airways Executive Club",   category:"Airline", points_currency:"Avios",              inr_per_point:1.00, expiry_rule:"Avios expire after 36 months of inactivity"},
    {lid:"lp_qatar",        name:"Qatar Airways Privilege Club",     category:"Airline", points_currency:"Avios",              inr_per_point:1.30, expiry_rule:"Qmiles expire 3 years from date of earning"},
    {lid:"lp_finnair",      name:"Finnair Plus",                     category:"Airline", points_currency:"Avios",              inr_per_point:1.00, expiry_rule:"Avios expire after 36 months of inactivity"},
    {lid:"lp_cathay",       name:"Cathay Pacific Asia Miles",        category:"Airline", points_currency:"Asia Miles",         inr_per_point:1.10, expiry_rule:"Miles expire 3 years from date of earning"},
    {lid:"lp_jal",          name:"Japan Airlines Mileage Bank",      category:"Airline", points_currency:"Miles",              inr_per_point:1.20, expiry_rule:"Miles expire 36 months from date of earning"},
    {lid:"lp_qantas",       name:"Qantas Frequent Flyer",            category:"Airline", points_currency:"Points",             inr_per_point:1.10, expiry_rule:"Points expire after 18 months of inactivity"},
    {lid:"lp_iberia",       name:"Iberia Plus",                      category:"Airline", points_currency:"Avios",              inr_per_point:1.00, expiry_rule:"Avios expire after 36 months of inactivity"},
    {lid:"lp_aerlingus",    name:"Aer Lingus AerClub",               category:"Airline", points_currency:"Avios",              inr_per_point:1.00, expiry_rule:"Avios expire after 36 months of inactivity"},
    {lid:"lp_alaska",       name:"Alaska Mileage Plan",              category:"Airline", points_currency:"Miles",              inr_per_point:1.40, expiry_rule:"Miles expire after 24 months of inactivity"},
    {lid:"lp_american",     name:"American Airlines AAdvantage",     category:"Airline", points_currency:"Miles",              inr_per_point:1.20, expiry_rule:"Miles expire after 18 months of inactivity"},
    // Airlines — SkyTeam
    {lid:"lp_flyingblue",   name:"Air France KLM Flying Blue",       category:"Airline", points_currency:"Miles",              inr_per_point:1.20, expiry_rule:"Miles expire after 24 months of inactivity"},
    {lid:"lp_virgin",       name:"Virgin Atlantic Flying Club",      category:"Airline", points_currency:"Points",             inr_per_point:1.10, expiry_rule:"Points expire after 36 months of inactivity"},
    // Airlines — Independent
    {lid:"lp_etihad",       name:"Etihad Guest",                     category:"Airline", points_currency:"Miles",              inr_per_point:1.10, expiry_rule:"Miles expire after 18 months of inactivity"},
    {lid:"lp_spiceclub",    name:"SpiceJet SpiceClub",               category:"Airline", points_currency:"SpiceClub Miles",    inr_per_point:0.40, expiry_rule:"Miles expire 1 year from date of earning"},
    {lid:"lp_airasia",      name:"AirAsia Rewards",                  category:"Airline", points_currency:"Points",             inr_per_point:0.30, expiry_rule:"Points expire after 12 months of inactivity"},
    {lid:"lp_lotusmiles",   name:"Vietnam Airlines LotusMiles",      category:"Airline", points_currency:"Miles",              inr_per_point:0.60, expiry_rule:"Miles expire 3 years from date of earning"},
    // Hotels
    {lid:"lp_marriott",     name:"Marriott Bonvoy",                  category:"Hotel",   points_currency:"Points",             inr_per_point:0.50, expiry_rule:"Points expire after 24 months of inactivity"},
    {lid:"lp_ihg",          name:"IHG One Rewards",                  category:"Hotel",   points_currency:"Points",             inr_per_point:0.40, expiry_rule:"Points expire after 12 months of inactivity"},
    {lid:"lp_clubitc",      name:"Club ITC Green Points",            category:"Hotel",   points_currency:"Green Points",       inr_per_point:1.00, expiry_rule:"Points valid for 3 years from date of earning"},
    {lid:"lp_accor",        name:"Accor Live Limitless",             category:"Hotel",   points_currency:"Points",             inr_per_point:1.60, expiry_rule:"Points expire after 12 months of inactivity"},
    {lid:"lp_radisson",     name:"Radisson Rewards",                 category:"Hotel",   points_currency:"Points",             inr_per_point:0.35, expiry_rule:"Points expire after 12 months of inactivity"},
    {lid:"lp_wyndham",      name:"Wyndham Rewards",                  category:"Hotel",   points_currency:"Points",             inr_per_point:0.45, expiry_rule:"Points expire after 18 months of inactivity"},
    {lid:"lp_hilton",       name:"Hilton Honors",                    category:"Hotel",   points_currency:"Points",             inr_per_point:0.30, expiry_rule:"Points expire after 12 months of inactivity"},
  ],

  // ── Credit Cards ─────────────────────────────────────────────────────────
  cards: [
    {
      lid:"cc_infinia",
      name:"HDFC Infinia Metal", bank:"HDFC Bank", network:"Visa",
      points_currency:"Reward Points", inr_per_point:1.00, annual_fee:14750,
      auto_transfer_to:null,
      milestones:[
        {spend_threshold:1000000, cycle_type:"billing_year",  benefit_type:"fee_waiver",   benefit_value:"Annual fee waived on Rs.10L spend in preceding 12 months", benefit_points:null,  stackable:false, sort_order:1},
        {spend_threshold:0,       cycle_type:"lifetime",      benefit_type:"bonus_points", benefit_value:"Welcome — 12,500 bonus Reward Points on fee payment",       benefit_points:12500, stackable:false, sort_order:2},
      ],
      partners:[
        {to_lid:"lp_krisflyer",  ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant–2 days", notes:""},
        {to_lid:"lp_airindia",   ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Few hours",      notes:""},
        {to_lid:"lp_flyingblue", ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_ba",         ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_iberia",     ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_qatar",      ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_etihad",     ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_turkish",    ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_united",     ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_aeroplan",   ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_spiceclub",  ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_airasia",    ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_finnair",    ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_lifemiles",  ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_lotusmiles", ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_thai",       ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_cathay",     ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_marriott",   ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_ihg",        ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_clubitc",    ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_accor",      ratio_from:2, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_radisson",   ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
        {to_lid:"lp_wyndham",    ratio_from:1, ratio_to:1, min_transfer:500,  transfer_time:"Instant",        notes:""},
      ],
    },
    {
      lid:"cc_bizblack",
      name:"HDFC Biz Black Metal", bank:"HDFC Bank", network:"Diners Club",
      points_currency:"Reward Points", inr_per_point:1.00, annual_fee:11800,
      auto_transfer_to:null,
      milestones:[
        {spend_threshold:150000, cycle_type:"lifetime",      benefit_type:"gift",        benefit_value:"Club Marriott membership + Taj stay voucher Rs.5,000 (spend Rs.1.5L in 90 days)", benefit_points:null, stackable:false, sort_order:1},
        {spend_threshold:500000, cycle_type:"calendar_year", benefit_type:"voucher",     benefit_value:"SmartBuy flight or Taj stay voucher Rs.5,000 — max 4 per year on Rs.20L total spend", benefit_points:null, stackable:true,  sort_order:2},
        {spend_threshold:750000, cycle_type:"billing_year",  benefit_type:"fee_waiver",  benefit_value:"Annual fee waived on Rs.7.5L spend in billing year", benefit_points:null, stackable:false, sort_order:3},
      ],
      partners:[
        {to_lid:"lp_krisflyer", ratio_from:1, ratio_to:1, min_transfer:500, transfer_time:"Instant–2 days", notes:"Only transfer partner for Biz Black"},
      ],
    },
    {
      lid:"cc_marriotthdfc",
      name:"HDFC Marriott Bonvoy", bank:"HDFC Bank", network:"Diners Club",
      points_currency:"Marriott Bonvoy Points", inr_per_point:0.50, annual_fee:3540,
      auto_transfer_to:"lp_marriott",
      auto_transfer_ratio_from:1, auto_transfer_ratio_to:1,
      milestones:[
        {spend_threshold:0,      cycle_type:"lifetime",      benefit_type:"other",   benefit_value:"Welcome: 1 Free Night Award (up to 15,000 pts) + Silver Elite status + 10 Elite Night Credits", benefit_points:null, stackable:false, sort_order:1},
        {spend_threshold:0,      cycle_type:"billing_year",  benefit_type:"other",   benefit_value:"Renewal: 1 Free Night Award (up to 15,000 pts)", benefit_points:null, stackable:false, sort_order:2},
        {spend_threshold:600000, cycle_type:"calendar_year", benefit_type:"other",   benefit_value:"Up to 3 additional Free Night Awards on higher milestone spends", benefit_points:null, stackable:true,  sort_order:3},
      ],
      partners:[],
    },
    {
      lid:"cc_magnusburgundy",
      name:"Axis Magnus for Burgundy", bank:"Axis Bank", network:"Mastercard",
      points_currency:"EDGE Reward Points", inr_per_point:1.00, annual_fee:35400,
      auto_transfer_to:null,
      milestones:[
        {spend_threshold:3000000, cycle_type:"billing_year", benefit_type:"fee_waiver", benefit_value:"Annual fee waived on Rs.30L spend (excl. insurance, gold, fuel)", benefit_points:null, stackable:false, sort_order:1},
      ],
      partners:[
        // Group A — annual cap 2L EDGE pts/year
        {to_lid:"lp_krisflyer",  ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_qatar",      ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_etihad",     ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_jal",        ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_aeroplan",   ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_united",     ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_turkish",    ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_thai",       ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_ethiopian",  ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_ba",         ratio_from:5, ratio_to:2, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_finnair",    ratio_from:5, ratio_to:2, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_lotusmiles", ratio_from:5, ratio_to:2, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_ana",        ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        {to_lid:"lp_wyndham",    ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group A — cap 2L pts/yr"},
        // Group B — annual cap 8L EDGE pts/year
        {to_lid:"lp_airindia",   ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group B — cap 8L pts/yr"},
        {to_lid:"lp_flyingblue", ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group B — cap 8L pts/yr"},
        {to_lid:"lp_qantas",     ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group B — cap 8L pts/yr"},
        {to_lid:"lp_spiceclub",  ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group B — cap 8L pts/yr"},
        {to_lid:"lp_airasia",    ratio_from:5, ratio_to:4, min_transfer:300, transfer_time:"Instant", notes:"Group B — cap 8L pts/yr"},
      ],
    },
    {
      lid:"cc_atlas",
      name:"Axis Atlas", bank:"Axis Bank", network:"Visa",
      points_currency:"EDGE Miles", inr_per_point:1.00, annual_fee:5900,
      auto_transfer_to:null,
      milestones:[
        {spend_threshold:300000,  cycle_type:"billing_year", benefit_type:"bonus_points", benefit_value:"Silver tier — 2,500 bonus EDGE Miles",                           benefit_points:2500,  stackable:false, sort_order:1},
        {spend_threshold:750000,  cycle_type:"billing_year", benefit_type:"bonus_points", benefit_value:"Gold tier — 2,500 milestone + 2,500 annual bonus EDGE Miles",    benefit_points:5000,  stackable:false, sort_order:2},
        {spend_threshold:1500000, cycle_type:"billing_year", benefit_type:"bonus_points", benefit_value:"Platinum tier — 5,000 milestone + 5,000 annual bonus EDGE Miles", benefit_points:10000, stackable:false, sort_order:3},
      ],
      partners:[
        // Group A — annual cap 30K EDGE miles/year
        {to_lid:"lp_krisflyer",  ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_etihad",     ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_turkish",    ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_united",     ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_jal",        ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_thai",       ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_ba",         ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_finnair",    ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_ethiopian",  ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_lotusmiles", ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        {to_lid:"lp_ana",        ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group A — cap 30K miles/yr"},
        // Group B — annual cap 120K EDGE miles/year
        {to_lid:"lp_airindia",   ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_flyingblue", ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_aeroplan",   ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_qantas",     ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_spiceclub",  ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_airasia",    ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_marriott",   ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_accor",      ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_ihg",        ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_clubitc",    ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
        {to_lid:"lp_wyndham",    ratio_from:1, ratio_to:2, min_transfer:500, transfer_time:"Instant", notes:"Group B — cap 120K miles/yr"},
      ],
    },
    {
      lid:"cc_mrcc",
      name:"Amex Membership Rewards Credit Card", bank:"American Express", network:"Amex",
      points_currency:"Membership Rewards Points", inr_per_point:0.50, annual_fee:1770,
      auto_transfer_to:null,
      milestones:[
        {spend_threshold:6000,   cycle_type:"calendar_month", benefit_type:"bonus_points", benefit_value:"4 transactions of Rs.1,500+ in a calendar month — 1,000 bonus MR pts",                    benefit_points:1000, stackable:true,  sort_order:1},
        {spend_threshold:20000,  cycle_type:"calendar_month", benefit_type:"bonus_points", benefit_value:"Spend Rs.20,000 in a calendar month — 1,000 bonus MR pts (one-time enrollment required)", benefit_points:1000, stackable:true,  sort_order:2},
        {spend_threshold:150000, cycle_type:"calendar_year",  benefit_type:"fee_waiver",   benefit_value:"Annual fee waived on Rs.1.5L annual spend",                                                benefit_points:null, stackable:false, sort_order:3},
      ],
      partners:[
        {to_lid:"lp_krisflyer", ratio_from:2, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 2:1 ratio"},
        {to_lid:"lp_ba",        ratio_from:2, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 2:1 ratio"},
        {to_lid:"lp_qatar",     ratio_from:2, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 2:1 ratio"},
        {to_lid:"lp_cathay",    ratio_from:2, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 2:1 ratio"},
        {to_lid:"lp_virgin",    ratio_from:2, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 2:1 ratio"},
        {to_lid:"lp_etihad",    ratio_from:2, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 2:1 ratio. Partnership ends June 2026"},
        {to_lid:"lp_marriott",  ratio_from:1, ratio_to:1, min_transfer:1000, transfer_time:"Instant",       notes:"Indian Amex — 1:1 ratio"},
        {to_lid:"lp_hilton",    ratio_from:1, ratio_to:0.9,min_transfer:1000,transfer_time:"Instant",       notes:"Indian Amex — 1,000 pts = 900 Hilton points"},
      ],
    },
    {
      lid:"cc_scapia",
      name:"Scapia Federal Bank Credit Card", bank:"Federal Bank", network:"Visa",
      points_currency:"Scapia Coins", inr_per_point:0.20, annual_fee:0,
      auto_transfer_to:null,
      milestones:[
        {spend_threshold:10000, cycle_type:"calendar_month", benefit_type:"other", benefit_value:"Unlimited domestic lounge access for the month (Visa: Rs.10,000; RuPay: Rs.15,000 spend)", benefit_points:null, stackable:true, sort_order:1},
        {spend_threshold:20000, cycle_type:"calendar_month", benefit_type:"other", benefit_value:"Airport privileges up to Rs.1,000 — dining, shopping or spa at domestic airports",           benefit_points:null, stackable:true, sort_order:2},
      ],
      partners:[],
    },
  ],

  // ── LP-to-LP transfer routes ─────────────────────────────────────────────
  lp_partners:[

    // ── Marriott Bonvoy → Airlines (3:1 standard; +5K bonus per 60K transferred) ──
    {from_lid:"lp_marriott", to_lid:"lp_airindia",   ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_krisflyer",  ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_flyingblue", ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_ba",         ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus Avios per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_iberia",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus Avios per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_aerlingus",  ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus Avios per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_qatar",      ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus Avios per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_etihad",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_turkish",    ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_cathay",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_jal",        ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_qantas",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_aeroplan",   ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_united",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+10,000 bonus miles per 60,000 pts (special United rate)"},
    {from_lid:"lp_marriott", to_lid:"lp_american",   ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"No transfer bonus. Marriott is the ONLY hotel partner for AAdvantage"},
    {from_lid:"lp_marriott", to_lid:"lp_alaska",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_ana",        ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_lufthansa",  ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_lifemiles",  ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"1–3 days",  notes:"No transfer bonus"},
    {from_lid:"lp_marriott", to_lid:"lp_spiceclub",  ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_ethiopian",  ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_lotusmiles", ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_thai",       ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},
    {from_lid:"lp_marriott", to_lid:"lp_virgin",     ratio_from:3, ratio_to:1, min_transfer:3000, transfer_time:"3–7 days",  notes:"+5,000 bonus miles per 60,000 pts transferred"},

    // ── Accor Live Limitless → Airlines ──────────────────────────────────────
    {from_lid:"lp_accor",    to_lid:"lp_flyingblue", ratio_from:1, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:"Best ratio — only 1:1 partner"},
    {from_lid:"lp_accor",    to_lid:"lp_qantas",     ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},
    {from_lid:"lp_accor",    to_lid:"lp_ba",         ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},
    {from_lid:"lp_accor",    to_lid:"lp_iberia",     ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},
    {from_lid:"lp_accor",    to_lid:"lp_qatar",      ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},
    {from_lid:"lp_accor",    to_lid:"lp_etihad",     ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},
    {from_lid:"lp_accor",    to_lid:"lp_aeroplan",   ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},
    {from_lid:"lp_accor",    to_lid:"lp_united",     ratio_from:2, ratio_to:1, min_transfer:2000, transfer_time:"Instant",   notes:""},

    // ── IHG One Rewards → Airlines (all 5:1) ─────────────────────────────────
    {from_lid:"lp_ihg",      to_lid:"lp_airindia",   ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only — call IHG Service Centre"},
    {from_lid:"lp_ihg",      to_lid:"lp_ba",         ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_krisflyer",  ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_flyingblue", ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_united",     ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_etihad",     ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_qatar",      ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_turkish",    ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},
    {from_lid:"lp_ihg",      to_lid:"lp_aeroplan",   ratio_from:5, ratio_to:1, min_transfer:10000, transfer_time:"4–6 weeks", notes:"Transfer via phone only"},

    // ── Avios LP→LP (BA as hub — all 1:1, instant, free) ─────────────────────
    {from_lid:"lp_ba",       to_lid:"lp_qatar",      ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com — BA is Avios hub"},
    {from_lid:"lp_ba",       to_lid:"lp_iberia",     ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com"},
    {from_lid:"lp_ba",       to_lid:"lp_finnair",    ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com"},
    {from_lid:"lp_ba",       to_lid:"lp_aerlingus",  ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com"},
    {from_lid:"lp_qatar",    to_lid:"lp_ba",         ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com — routes via BA"},
    {from_lid:"lp_iberia",   to_lid:"lp_ba",         ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com"},
    {from_lid:"lp_finnair",  to_lid:"lp_ba",         ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com — routes via BA"},
    {from_lid:"lp_aerlingus",to_lid:"lp_ba",         ratio_from:1, ratio_to:1, min_transfer:1,    transfer_time:"Instant",   notes:"Free transfer via avios.com"},
  ],
};


function createClient(url, key) {
  const h = { apikey:key, Authorization:`Bearer ${key}`, "Content-Type":"application/json", Prefer:"return=representation" };
  const base = `${url}/rest/v1`;
  const req = async (path, opts={}) => {
    try {
      const r = await fetch(`${base}${path}`, {...opts, headers:h});
      let data = null;
      try { data = await r.json(); } catch(_) {}
      return { data: Array.isArray(data)?data:data?[data]:[], error: r.ok?null:data };
    } catch(e) { return { data:[], error:{message:e.message} }; }
  };
  return {
    from: t => ({
      select: (q="") => req(`/${t}?select=*${q}`),
      insert: row => req(`/${t}`, {method:"POST", body:JSON.stringify(row)}),
      update: (id,row) => req(`/${t}?id=eq.${id}`, {method:"PATCH", body:JSON.stringify(row)}),
      delete: id => req(`/${t}?id=eq.${id}`, {method:"DELETE"}),
      filter: (col,val) => req(`/${t}?select=*&${col}=eq.${encodeURIComponent(val)}`),
    }),
    storage: {
      upload: async (bucket, path, file) => {
        try {
          const r = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method:"POST", body:file,
            headers:{apikey:key, Authorization:`Bearer ${key}`, "Content-Type":file.type, "x-upsert":"true"}
          });
          const txt = await r.text();
          let d={}; try{d=JSON.parse(txt);}catch(_){}
          if(r.ok) return {data:d,error:null};
          const r2 = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
            method:"PUT", body:file,
            headers:{apikey:key, Authorization:`Bearer ${key}`, "Content-Type":file.type, "x-upsert":"true"}
          });
          const txt2=await r2.text(); let d2={}; try{d2=JSON.parse(txt2);}catch(_){}
          return r2.ok?{data:d2,error:null}:{data:null,error:{message:`${r2.status}: ${txt2}`}};
        } catch(e) { return {data:null,error:{message:e.message}}; }
      },
      getPublicUrl: (bucket,path) => `${url}/storage/v1/object/public/${bucket}/${path}`,
    },
  };
}

// ── Design tokens: private-banking premium ────────────────────────────────────
const bg   = "#f5f5f3";          // warm off-white background
const surf = "#ffffff";           // card surface
const surf2= "#f9f9f8";          // secondary surface
const surf3= "#f0efed";          // tertiary / hover
const bdr  = "#e9e8e5";          // primary border — thin, barely visible
const bdr2 = "#d8d6d2";          // stronger border
const txt  = "#0e0e0d";          // near-black primary text
const mut  = "#8a8883";          // secondary text — warm grey
const mut2 = "#5c5a57";          // tertiary text
const acc  = "#b07d3a";          // restrained gold — not flashy
const grn  = "#2d6a4f";          // muted forest green for positive values
const red  = "#9b2335";
const amber= "#c67c1a";          // amber for warnings          // muted burgundy for negative
const amb  = "#8a6914";          // amber for warnings

// Font: Manrope — all weights 400/500/600/700
// tabular-nums via font-variant-numeric on number elements

const inp={width:"100%",padding:"10px 14px",background:surf,border:`1px solid ${bdr}`,borderRadius:10,color:txt,fontSize:13,fontWeight:400,outline:"none",boxSizing:"border-box",marginBottom:14,fontFamily:"'Manrope',sans-serif",letterSpacing:"-0.01em",transition:"border-color 0.15s"};
const pbtn={display:"inline-flex",alignItems:"center",gap:7,padding:"10px 20px",borderRadius:10,border:`1px solid ${txt}`,cursor:"pointer",fontSize:13,fontWeight:600,background:txt,color:"#fff",letterSpacing:"-0.01em",fontFamily:"'Manrope',sans-serif",transition:"opacity 0.15s"};
const gbtn={...pbtn,background:surf,color:mut2,border:`1px solid ${bdr}`};
const dbtn={...pbtn,background:surf,color:red,border:`1px solid ${bdr}`};

// Tabular number style — apply to all financial figures
const num={fontVariantNumeric:"tabular-nums",letterSpacing:"-0.02em"};

function lbl(t){return <div style={{fontSize:10,color:mut,fontWeight:500,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6,fontFamily:"'Manrope',sans-serif"}}>{t}</div>;}
function inrFmt(v){if(v>=100000)return"₹"+(v/100000).toFixed(1)+"L";if(v>=1000)return"₹"+(v/1000).toFixed(1)+"K";return"₹"+Math.round(v).toLocaleString("en-IN");}
function fmtDate(d){
  if(!d) return "—";
  const s=d.substring(0,10);
  const p=s.split("-");
  if(p.length!==3) return s;
  return p[2]+"/"+p[1]+"/"+p[0].slice(2); // DD/MM/YY
}

function fmtMonth(ym){
  if(!ym) return "—";
  const [y,m]=ym.split("-");
  if(!y||!m) return ym;
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return(months[parseInt(m)-1]||m)+" '"+y.slice(2);
}

function ordinal(n){const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}

function Modal({show,onClose,title,children,wide=false}){
  if(!show) return null;
  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(17,17,16,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(3px)"}}>
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:20,padding:"28px 28px 24px",width:"100%",maxWidth:wide?660:500,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 8px 40px rgba(0,0,0,0.10)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <span style={{fontSize:15,fontWeight:600,color:txt,letterSpacing:"-0.02em",fontFamily:"'Manrope',sans-serif"}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:18,lineHeight:1,padding:"2px 6px",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Card({children,style={},...rest}){
  return <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:18,padding:"22px 24px",boxShadow:"0 1px 2px rgba(0,0,0,0.04),0 0 0 0 transparent",...style}} {...rest}>{children}</div>;
}

function Hdr({title,sub,action}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
      <div>
        <div style={{fontSize:24,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>{title}</div>
        {sub&&<div style={{fontSize:13,color:mut,marginTop:5,fontWeight:400}}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

function LogoCircle({url,name,size=40}){
  const [err,setErr]=useState(false);
  const init=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if(url&&url.length>10&&!err) return(
    <div style={{width:size,height:size,borderRadius:size*0.22,overflow:"hidden",flexShrink:0,border:`1px solid ${bdr}`,background:surf2}}>
      <img src={url} alt={name||""} style={{width:"100%",height:"100%",objectFit:"contain",padding:size*0.08,display:"block"}} onError={()=>setErr(true)}/>
    </div>
  );
  return(
    <div style={{width:size,height:size,borderRadius:size*0.22,background:acc+"18",border:`1.5px solid ${acc}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      <span style={{fontSize:size*0.32,fontWeight:700,color:acc,lineHeight:1}}>{init}</span>
    </div>
  );
}

function LogoUpload({current,onUpload}){
  const handleFile=f=>{
    if(!f) return;
    if(!f.type.startsWith("image/")) return alert("Please upload an image file");
    if(f.size>2000000) return alert("Max 2MB");
    const r=new FileReader(); r.onload=e=>onUpload(f,e.target.result); r.readAsDataURL(f);
  };
  return(
    <div style={{marginBottom:12}}>
      {lbl("Logo (optional)")}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:52,height:52,borderRadius:10,border:`2px dashed ${bdr2}`,background:surf2,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
          {current?<img src={current} style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:20}}>img</span>}
        </div>
        <label style={{...gbtn,padding:"6px 14px",fontSize:12,cursor:"pointer"}}>
          {current?"Change":"Upload"} Logo
          <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        </label>
        {current&&<button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={()=>onUpload(null,null)}>Remove</button>}
      </div>
    </div>
  );
}

function Empty({icon="o",msg}){
  return <div style={{textAlign:"center",padding:"48px 20px",color:mut}}><div style={{fontSize:28,marginBottom:8}}>{icon}</div><div style={{fontSize:13}}>{msg}</div></div>;
}

// Setup
function Setup({onDone}){
  const [url,setUrl]=useState(""); const [key,setKey]=useState(""); const [msg,setMsg]=useState("");
  const go=async()=>{
    if(!url||!key) return setMsg("Both fields required");
    const u=url.trim().replace(/\/+$/,"").replace(/\/rest\/v1\/?$/,""), k=key.trim();
    try{const r=await fetch(`${u}/rest/v1/owners?select=id&limit=1`,{headers:{apikey:k,Authorization:`Bearer ${k}`}});if(r.status===401||r.status===403) return setMsg("Invalid key");}catch(_){}
    localStorage.setItem("pv_u",u); localStorage.setItem("pv_k",k); onDone(createClient(u,k));
  };
  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(135deg,${bg},#f0ede8)`,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{maxWidth:420,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:22,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>PointsVault</div>
          <div style={{fontSize:12,color:mut,marginTop:6,fontWeight:400,letterSpacing:"0.01em"}}>Private Rewards Management</div>
        </div>
        <Card style={{padding:28}}>
          {lbl("Supabase Project URL")}<input style={inp} placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/>
          {lbl("Anon Public Key")}<input style={inp} type="password" placeholder="eyJ..." value={key} onChange={e=>setKey(e.target.value)}/>
          {msg&&<div style={{color:red,fontSize:12,marginBottom:12,padding:"8px 12px",background:"#fef2f2",borderRadius:8}}>{msg}</div>}
          <button style={{...pbtn,width:"100%",justifyContent:"center",padding:"11px"}} onClick={go}>Connect</button>
        </Card>
      </div>
    </div>
  );
}

// ── PortfolioChart — SVG line chart, works for programs or cards ───────────────
function UnifiedChart({txns,cards,progs,mc,mp,owners}){
  const [period,setPeriod]=useState("3m");
  const [ownerF,setOwnerF]=useState("all");
  const [typeF,setTypeF]=useState("all"); // all | card | program
  const [entityF,setEntityF]=useState("all");
  const [metric,setMetric]=useState("points");
  const [mode,setMode]=useState("total"); // total | individual
  const [hover,setHover]=useState(null);

  const pDays={"1m":30,"3m":90,"6m":180,"1y":365,"3y":1095,"LT":99999};

  // Build series — either one combined line or one per entity
  const {series,colors,labels} = useMemo(()=>{
    const now=new Date();
    const cutoff=new Date(now.getTime()-pDays[period]*86400000);

    const allEntities=[
      ...(typeF==="program"?[]:(cards||[]).filter(e=>ownerF==="all"||e.owner_id===ownerF).filter(e=>entityF==="all"||e.id===entityF)),
      ...(typeF==="card"?[]:(progs||[]).filter(e=>ownerF==="all"||e.owner_id===ownerF).filter(e=>entityF==="all"||e.id===entityF)),
    ];

    const getMaster=(e)=>{
      const isCard=cards.some(c=>c.id===e.id);
      return isCard?mc.find(m=>m.id===e.master_id):mp.find(m=>m.id===e.master_id);
    };
    const isCard=(e)=>cards.some(c=>c.id===e.id);

    const buildSeries=(entities)=>{
      if(!entities.length) return [];
      const openBals={};
      entities.forEach(e=>{
        const pre=(txns||[]).filter(t=>t.entity_id===e.id&&new Date(t.txn_date).getTime()<cutoff.getTime());
        openBals[e.id]=(e.opening_balance||0)+pre.reduce((a,t)=>a+t.points,0);
      });
      const inRange=(txns||[]).filter(t=>entities.some(e=>e.id===t.entity_id)&&new Date(t.txn_date).getTime()>=cutoff.getTime());
      const dateSet=new Set(inRange.map(t=>t.txn_date));
      dateSet.add(cutoff.toISOString().split("T")[0]);
      dateSet.add(now.toISOString().split("T")[0]);
      const dates=[...dateSet].sort();
      const run={...openBals};
      return dates.map(date=>{
        inRange.filter(t=>t.txn_date===date).forEach(t=>{if(run[t.entity_id]!==undefined)run[t.entity_id]+=t.points;});
        let total=0;
        entities.forEach(e=>{
          const m=getMaster(e);
          total+=metric==="inr"?(run[e.id]||0)*(m?.inr_per_point||0):(run[e.id]||0);
        });
        return{date,value:total};
      });
    };

    if(mode==="total"){
      return{series:[buildSeries(allEntities)],colors:[acc],labels:["Portfolio"]};
    } else {
      // Individual mode — one line per entity (cap at 8)
      const ents=allEntities.slice(0,8);
      const palette=[acc,txt,grn,red,"#7c6fcd","#2980b9","#e67e22","#16a085"];
      const sArr=ents.map(e=>buildSeries([e]));
      const lArr=ents.map(e=>{
        const m=getMaster(e);
        const ic=isCard(e);
        return(e.nickname||(ic?(mc.find(x=>x.id===e.master_id)?.name||"Card"):(mp.find(x=>x.id===e.master_id)?.name||"LP")));
      });
      return{series:sArr,colors:palette,labels:lArr};
    }
  },[txns,cards,progs,mc,mp,ownerF,typeF,entityF,period,metric,mode]);

  const W=700,H=200,PL=64,PR=16,PT=14,PB=32;
  const cW=W-PL-PR,cH=H-PT-PB;

  // Compute mins/maxes across all series
  const allVals=series.flat().map(s=>s.value);
  const isEmpty=series.every(s=>s.length<2);
  const minV=isEmpty?0:Math.min(...allVals,0);
  const maxV=isEmpty?1:Math.max(...allVals,1);
  const range=maxV-minV||1;
  const toX=(i,len)=>PL+(i/(Math.max(len-1,1)))*cW;
  const toY=v=>PT+cH-((v-minV)/range)*cH;
  const latestVals=series.map(s=>s.length>0?s[s.length-1].value:0);
  const totalLatest=latestVals.reduce((a,b)=>a+b,0);

  // Build SVG paths
  const paths=series.map(s=>{
    if(s.length<2) return{d:"",area:""};
    const d=s.map((pt,i)=>(i===0?"M":"L")+toX(i,s.length).toFixed(1)+","+toY(pt.value).toFixed(1)).join(" ");
    const area=d+" L"+toX(s.length-1,s.length).toFixed(1)+","+(PT+cH).toFixed(1)+" L"+toX(0,s.length).toFixed(1)+","+(PT+cH).toFixed(1)+" Z";
    return{d,area};
  });

  const yTicks=4;
  const yVals=Array.from({length:yTicks+1},(_,i)=>minV+(range/yTicks)*i);
  const fmtTick=v=>metric==="inr"?inrFmt(v):Math.round(v).toLocaleString("en-IN");
  const fmtD=d=>new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short"});

  // Use first series for x-axis labels
  const xSeries=series[0]||[];
  const xIdxs=xSeries.length<=1?[]:[0,Math.floor((xSeries.length-1)/2),xSeries.length-1];

  const onMove=e=>{
    if(isEmpty||!xSeries.length) return;
    const r=e.currentTarget.getBoundingClientRect();
    const mx=((e.clientX-r.left)/r.width)*W;
    if(mx<PL||mx>W-PR){setHover(null);return;}
    const rawIdx=(mx-PL)/cW*(xSeries.length-1);
    const i=Math.round(Math.max(0,Math.min(xSeries.length-1,rawIdx)));
    const hoverVals=series.map(s=>s[Math.min(i,s.length-1)]?.value||0);
    setHover({x:toX(i,xSeries.length),ys:hoverVals.map(v=>toY(v)),vs:hoverVals,d:xSeries[i]?.date||""});
  };

  const ss={fontSize:11,color:mut2,border:"1px solid "+bdr,borderRadius:6,padding:"4px 8px",background:surf,cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontWeight:500,outline:"none"};
  const pb=a=>({padding:"3px 9px",borderRadius:20,border:"1px solid "+(a?txt:bdr),cursor:"pointer",fontSize:10,fontWeight:a?600:400,background:a?txt:"transparent",color:a?"#fff":mut2,fontFamily:"'Manrope',sans-serif"});
  const tb=a=>({padding:"2px 9px",borderRadius:6,border:"none",background:a?surf:"transparent",color:a?txt:mut,fontSize:10,fontWeight:a?600:400,cursor:"pointer",fontFamily:"'Manrope',sans-serif",boxShadow:a?"0 1px 2px rgba(0,0,0,0.07)":"none"});

  // Entity options based on typeF
  const entityOpts=typeF==="card"
    ?(cards||[]).filter(e=>ownerF==="all"||e.owner_id===ownerF).map(e=>{const m=mc.find(x=>x.id===e.master_id);return{id:e.id,name:e.nickname||m?.name||"Card"};})
    :typeF==="program"
    ?(progs||[]).filter(e=>ownerF==="all"||e.owner_id===ownerF).map(e=>{const m=mp.find(x=>x.id===e.master_id);return{id:e.id,name:e.nickname||m?.name||"LP"};})
    :[];

  const displayVal=hover?hover.vs.reduce((a,b)=>a+b,0):totalLatest;
  const displayDate=hover?fmtD(hover.d):"";

  return(
    <Card style={{marginTop:16}}>
      {/* Controls */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:2}}>Portfolio over time</div>
          {!isEmpty&&<div style={{fontSize:18,fontWeight:700,color:hover?acc:txt,fontFamily:"'Manrope',sans-serif",fontVariantNumeric:"tabular-nums",transition:"color 0.1s"}}>
            {metric==="inr"?inrFmt(displayVal):displayVal.toLocaleString("en-IN")}
            <span style={{fontSize:10,color:mut,fontWeight:400,marginLeft:5}}>{metric==="inr"?"est. value":"pts"}</span>
            {hover&&<span style={{fontSize:10,color:mut,fontWeight:400,marginLeft:8}}>{displayDate}</span>}
          </div>}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          {/* Pts/₹ toggle */}
          <div style={{display:"flex",gap:2,background:surf3,borderRadius:7,padding:2}}>
            {["points","inr"].map(m=><button key={m} onClick={()=>setMetric(m)} style={tb(metric===m)}>{m==="inr"?"₹":"Pts"}</button>)}
          </div>
          {/* Total/Individual toggle */}
          <div style={{display:"flex",gap:2,background:surf3,borderRadius:7,padding:2}}>
            <button onClick={()=>setMode("total")} style={tb(mode==="total")}>Total</button>
            <button onClick={()=>setMode("individual")} style={tb(mode==="individual")}>Individual</button>
          </div>
          {/* Owner */}
          <select value={ownerF} onChange={e=>{setOwnerF(e.target.value);setEntityF("all");}} style={ss}>
            <option value="all">All owners</option>
            {(owners||[]).map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {/* Type */}
          <select value={typeF} onChange={e=>{setTypeF(e.target.value);setEntityF("all");}} style={ss}>
            <option value="all">All</option>
            <option value="card">Credit Cards</option>
            <option value="program">Loyalty Programs</option>
          </select>
          {/* Entity — only show when typeF is not "all" */}
          {typeF!=="all"&&<select value={entityF} onChange={e=>setEntityF(e.target.value)} style={ss}>
            <option value="all">All {typeF==="card"?"cards":"programs"}</option>
            {entityOpts.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
          </select>}
        </div>
      </div>

      {/* Period pills */}
      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {["1m","3m","6m","1y","3y","LT"].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} style={pb(period===p)}>{p==="LT"?"All":p}</button>
        ))}
      </div>

      {/* Individual mode legend */}
      {mode==="individual"&&!isEmpty&&(
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
          {labels.map((l,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:mut}}>
              <div style={{width:12,height:3,borderRadius:2,background:colors[i]}}/>
              {l}
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {isEmpty
        ?<div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",color:mut,fontSize:11}}>Add transactions to see trend</div>
        :<div style={{width:"100%",overflowX:"hidden"}}>
          <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"auto",display:"block",cursor:"crosshair"}} onMouseMove={onMove} onMouseLeave={()=>setHover(null)}>
            <defs>
              {series.map((_,i)=>(
                <linearGradient key={i} id={"ug"+i} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors[i]} stopOpacity={mode==="total"?0.10:0.05}/>
                  <stop offset="100%" stopColor={colors[i]} stopOpacity="0"/>
                </linearGradient>
              ))}
            </defs>
            {yVals.map((v,i)=><line key={i} x1={PL} x2={W-PR} y1={toY(v)} y2={toY(v)} stroke={bdr} strokeWidth="0.5"/>)}
            {yVals.map((v,i)=><text key={i} x={PL-4} y={toY(v)+3} textAnchor="end" fontSize="8" fill={mut} fontFamily="Manrope">{fmtTick(v)}</text>)}
            {xIdxs.map(i=><text key={i} x={toX(i,xSeries.length)} y={H-4} textAnchor="middle" fontSize="8" fill={mut} fontFamily="Manrope">{fmtD(xSeries[i].date)}</text>)}
            {paths.map((p,i)=>p.area&&<path key={"a"+i} d={p.area} fill={"url(#ug"+i+")"}/>)}
            {paths.map((p,i)=>p.d&&<path key={"l"+i} d={p.d} fill="none" stroke={colors[i]} strokeWidth={mode==="total"?"2":"1.5"} strokeLinecap="round" strokeLinejoin="round"/>)}
            {hover&&<line x1={hover.x} x2={hover.x} y1={PT} y2={PT+cH} stroke={mut} strokeWidth="0.75" strokeDasharray="3,2" opacity="0.4"/>}
            {hover&&hover.ys.map((y,i)=><circle key={i} cx={hover.x} cy={y} r="3" fill={surf} stroke={colors[i]} strokeWidth="1.5"/>)}
            {hover&&(()=>{
              const ttW=130,ttH=mode==="individual"?14+series.length*14:42;
              const tx=Math.min(hover.x+10,W-PR-ttW-4);
              const ty=Math.max(PT+2,hover.ys[0]-ttH-6);
              return <g>
                <rect x={tx} y={ty} width={ttW} height={ttH} rx="5" fill={surf} stroke={bdr} strokeWidth="0.75"/>
                <text x={tx+7} y={ty+13} fontSize="8" fill={mut} fontFamily="Manrope">{fmtD(hover.d)}</text>
                {mode==="total"&&<text x={tx+7} y={ty+27} fontSize="11" fill={colors[0]} fontFamily="Manrope" fontWeight="700">{metric==="inr"?inrFmt(hover.vs[0]):hover.vs[0].toLocaleString("en-IN")}</text>}
                {mode==="individual"&&hover.vs.map((v,i)=><text key={i} x={tx+7} y={ty+27+i*14} fontSize="9" fill={colors[i]} fontFamily="Manrope" fontWeight="600">{labels[i]}: {metric==="inr"?inrFmt(v):v.toLocaleString("en-IN")}</text>)}
              </g>;
            })()}
            {!hover&&paths.map((p,i)=>series[i].length>0&&<circle key={i} cx={toX(series[i].length-1,series[i].length)} cy={toY(series[i][series[i].length-1].value)} r="2.5" fill={colors[i]}/>)}
          </svg>
        </div>
      }
    </Card>
  );
}


// ── OvList — filterable overview list panel ────────────────────────────────────
function OvList({title,items,filterOptions,owners,onNav}){
  const [ownerF,setOwnerF]=useState("all");
  const [catF,setCatF]=useState("all");

  const filtered=[...items]
    .filter(item=>{
      if(ownerF!=="all"&&item.ownerId!==ownerF) return false;
      if(catF==="all") return true;
      // Support both plain category match and bank:/net: prefixed match
      if(catF.startsWith("bank:")) return item.cat===catF||item.catBank===catF.slice(5);
      if(catF.startsWith("net:"))  return item.catNet===catF.slice(4);
      return item.cat===catF;
    })
    .sort((a,b)=>(b.balance||0)-(a.balance||0))
    .slice(0,6);

  const selStyle={fontSize:10,color:mut2,border:`1px solid ${bdr}`,borderRadius:6,padding:"3px 8px",background:surf,cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontWeight:500,outline:"none"};

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8,flexWrap:"wrap",flexShrink:0}}>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",flexShrink:0}}>{title}</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <select value={ownerF} onChange={e=>setOwnerF(e.target.value)} style={selStyle}>
            <option value="all">All owners</option>
            {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select value={catF} onChange={e=>setCatF(e.target.value)} style={selStyle}>
            <option value="all">All</option>
            {filterOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={onNav} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:500,padding:0,fontFamily:"'Manrope',sans-serif",flexShrink:0}}>View all</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",minHeight:0}}>
      {items.length===0
        ?<div style={{color:mut,fontSize:12,textAlign:"center",padding:"16px 0"}}>None yet</div>
        :filtered.length===0
          ?<div style={{color:mut,fontSize:12,textAlign:"center",padding:"16px 0"}}>No matches</div>
          :filtered.map(item=>(
            <div key={item.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${bdr}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
                <LogoCircle url={item.logo} name={item.name} size={32}/>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>{item.name}</div>
                  {item.sub&&<div style={{fontSize:10,color:mut,marginTop:1,fontWeight:400}}>{item.sub}</div>}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                <div className="pv-num" style={{fontSize:12,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{(item.balance||0).toLocaleString("en-IN")}</div>
                {item.inrVal>0&&<div style={{fontSize:10,color:grn,marginTop:1,fontWeight:500}}>{inrFmt(item.inrVal)}</div>}
              </div>
            </div>
          ))
      }
      {filtered.length>0&&(()=>{
        const totalMatch=items.filter(item=>{
          if(ownerF!=="all"&&item.ownerId!==ownerF) return false;
          if(catF==="all") return true;
          if(catF.startsWith("bank:")) return item.catBank===catF.slice(5);
          if(catF.startsWith("net:"))  return item.catNet===catF.slice(4);
          return item.cat===catF;
        }).length;
        return totalMatch>6?(
          <div style={{fontSize:10,color:mut,textAlign:"center",paddingTop:10,fontWeight:400}}>
            {totalMatch-6} more · <button onClick={onNav} style={{background:"none",border:"none",cursor:"pointer",color:acc,fontSize:10,fontWeight:500,padding:0}}>view all</button>
          </div>
        ):null;
      })()}
      </div>
    </div>
  );
}

// ── Overview ───────────────────────────────────────────────────────────────────
function Overview({db,owners,onNavigate}){
  const [cards,setCards]=useState([]);
  const [progs,setProgs]=useState([]);
  const [mc,setMc]=useState([]);
  const [mp,setMp]=useState([]);
  const [transfers,setTransfers]=useState([]);
  const [vouchers,setVouchers]=useState([]);
  const [txns,setTxns]=useState([]);
  const [busy,setBusy]=useState(true);
  const [ownerF,setOwnerF]=useState("all");
  const [catF,setCatF]=useState("all");

  useEffect(()=>{
    (async()=>{
      setBusy(true);
      const [c,p,mca,mpa,tr,v,t]=await Promise.all([
        db.from("my_cards").select(),db.from("my_programs").select(),
        db.from("master_cards").select(),db.from("master_programs").select(),
        db.from("transfer_log").select(),db.from("vouchers").select(),
        db.from("point_transactions").select(),
      ]);
      setCards(c.data||[]); setProgs(p.data||[]);
      setMc(mca.data||[]); setMp(mpa.data||[]);
      setTransfers((tr.data||[]).sort((a,b)=>new Date(b.transfer_date)-new Date(a.transfer_date)));
      setVouchers(v.data||[]);
      setTxns(t.data||[]);
      setBusy(false);
    })();
  },[]);

  const gmc=id=>mc.find(m=>m.id===id);
  const gmp=id=>mp.find(m=>m.id===id);
  const own=id=>owners.find(o=>o.id===id)?.name||"";

  const fCards=cards.filter(c=>{
    if(ownerF!=="all"&&c.owner_id!==ownerF) return false;
    if(catF!=="all"&&catF!=="cc") return false;
    return true;
  });
  const fProgs=progs.filter(p=>{
    if(ownerF!=="all"&&p.owner_id!==ownerF) return false;
    const m=gmp(p.master_id);
    if(catF==="cc") return false;
    if(catF!=="all"&&m?.category!==catF) return false;
    return true;
  });

  const tCP=fCards.reduce((a,c)=>a+(c.points_balance||0),0);
  const tPP=fProgs.reduce((a,p)=>a+(p.points_balance||0),0);
  const cInr=fCards.reduce((a,c)=>a+(c.points_balance||0)*(gmc(c.master_id)?.inr_per_point||0),0);
  const pInr=fProgs.reduce((a,p)=>a+(p.points_balance||0)*(gmp(p.master_id)?.inr_per_point||0),0);
  const tInr=cInr+pInr;
  const actV=vouchers.filter(v=>!v.redeemed&&(ownerF==="all"||v.owner_id===ownerF)).length;

  if(busy) return <div style={{color:mut,padding:60,textAlign:"center"}}>Loading...</div>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:22,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>Overview</div>
          <div style={{fontSize:12,color:mut,marginTop:5,fontWeight:400}}>Your rewards portfolio at a glance</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <select style={{...inp,marginBottom:0,width:"auto",fontSize:12,padding:"6px 10px"}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
            <option value="all">All Owners</option>
            {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <select style={{...inp,marginBottom:0,width:"auto",fontSize:12,padding:"6px 10px"}} value={catF} onChange={e=>setCatF(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="cc">Credit Cards</option>
            {["Airline","Hotel","Retail","Dining","Fuel","Other"].map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Portfolio Value",value:tInr>0?inrFmt(tInr):"—",unit:"",sub:null,nav:null,accent:grn,dark:true,breakdownCC:tCP,breakdownLP:tPP},
          {label:"Credit Cards",value:tCP.toLocaleString("en-IN"),unit:"pts",sub:fCards.length+" cards"+(cInr>0?" · "+inrFmt(cInr):""),nav:"my-cards"},
          {label:"Loyalty Programs",value:tPP.toLocaleString("en-IN"),unit:"pts",sub:fProgs.length+" programs"+(pInr>0?" · "+inrFmt(pInr):""),nav:"my-programs"},
          {label:"Vouchers",value:String(actV),unit:"",sub:"active vouchers",nav:"vouchers"},
        ].map((s,i)=>(
          <div key={i} style={{background:s.dark?txt:surf,border:s.dark?"none":`1px solid ${bdr}`,borderRadius:18,padding:"22px 24px",boxShadow:s.dark?"none":"0 1px 2px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:10,fontWeight:500,color:s.dark?"rgba(255,255,255,0.45)":mut,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:14}}>{s.label}</div>
            <div className="pv-num" style={{fontSize:28,fontWeight:700,color:s.dark?"#fff":s.accent||txt,lineHeight:1,fontFamily:"'Manrope',sans-serif"}}>{s.value}</div>
            {s.unit&&<div style={{fontSize:11,fontWeight:500,color:s.dark?"rgba(255,255,255,0.35)":mut,marginTop:3,letterSpacing:"0.06em",textTransform:"uppercase"}}>{s.unit}</div>}
            {s.sub&&<div style={{fontSize:12,color:s.dark?"rgba(255,255,255,0.45)":mut,marginTop:8,fontWeight:400}}>{s.sub}</div>}
            {s.breakdownCC!==undefined&&<div style={{marginTop:8}}>
              <div className="pv-num" style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:400}}>{s.breakdownCC.toLocaleString("en-IN")} CC pts</div>
              <div className="pv-num" style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:400,marginTop:2}}>{s.breakdownLP.toLocaleString("en-IN")} Loyalty pts</div>
            </div>}
            {s.nav&&<button onClick={()=>onNavigate(s.nav)} style={{marginTop:14,background:"none",border:`1px solid ${s.dark?"rgba(255,255,255,0.25)":bdr}`,cursor:"pointer",fontSize:11,color:s.dark?"rgba(255,255,255,0.7)":mut2,fontWeight:500,padding:"5px 12px",borderRadius:7,fontFamily:"'Manrope',sans-serif",letterSpacing:"0.02em"}}>View all</button>}
          </div>
        ))}
      </div>

      {fProgs.filter(p=>{ const d=p.expiry_date?Math.round((new Date(p.expiry_date)-new Date())/86400000):null; return d!==null&&d<=30; }).map(p=>{
        const m=gmp(p.master_id); const d=Math.round((new Date(p.expiry_date)-new Date())/86400000);
        return(<div key={p.id} style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
          <span>Warning</span>
          <div style={{fontSize:13,color:"#92400e"}}><strong>{p.nickname||m?.name}</strong> - {(p.points_balance||0).toLocaleString()} pts expiring in <strong>{d} days</strong></div>
        </div>);
      })}

      <style>{`
        @media (max-width: 700px) {
          .ov-grid { display: flex !important; flex-direction: column !important; }
          .ov-col  { width: 100% !important; }
        }
        @media (min-width: 701px) {
          .ov-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; align-items: start !important; }
          .ov-col  { display: flex !important; flex-direction: column !important; }
        }
      `}</style>
      <div className="ov-grid" style={{gap:16,marginBottom:0}}>
        {/* LEFT COL — Loyalty Programs */}
        <div className="ov-col">
          <Card className="ov-list-card" style={{height:340,display:"flex",flexDirection:"column"}}>
            <OvList
              title="Loyalty Programs"
              onNav={()=>onNavigate("my-programs")}
              owners={owners}
              filterOptions={[
                {value:"Airline",label:"Airline"},
                {value:"Hotel",label:"Hotel"},
                {value:"Retail",label:"Retail"},
                {value:"Dining",label:"Dining"},
                {value:"Fuel",label:"Fuel"},
                {value:"Other",label:"Other"},
              ]}
              items={fProgs.map(p=>{
                const m=gmp(p.master_id);
                return{id:p.id,logo:m?.logo_url,name:p.nickname||m?.name,sub:own(p.owner_id)+(p.tier?" · "+p.tier:""),balance:p.points_balance||0,inrVal:(p.points_balance||0)*(m?.inr_per_point||0),ownerId:p.owner_id,cat:m?.category||"Other"};
              })}
            />
          </Card>
        </div>
        {/* RIGHT COL — Credit Cards */}
        <div className="ov-col">
          <Card className="ov-list-card" style={{height:340,display:"flex",flexDirection:"column"}}>
            <OvList
              title="Credit Cards"
              onNav={()=>onNavigate("my-cards")}
              owners={owners}
              filterOptions={[
                ...([...new Set(fCards.map(c=>gmc(c.master_id)?.bank).filter(Boolean))].sort().map(b=>({value:"bank:"+b,label:b}))),
                ...([...new Set(fCards.map(c=>gmc(c.master_id)?.network).filter(Boolean))].sort().map(n=>({value:"net:"+n,label:n}))),
              ]}
              items={fCards.map(c=>{
                const m=gmc(c.master_id);
                return{id:c.id,logo:m?.logo_url,name:(c.nickname||m?.name||"")+(c.last4?" ·· "+c.last4:""),sub:own(c.owner_id)+(m?.network?" · "+m.network:""),balance:c.points_balance||0,inrVal:(c.points_balance||0)*(m?.inr_per_point||0),ownerId:c.owner_id,cat:"bank:"+(m?.bank||""),catBank:m?.bank||"",catNet:m?.network||""};
              })}
            />
          </Card>
        </div>
      </div>
      <UnifiedChart txns={txns} cards={cards} progs={progs} mc={mc} mp={mp} owners={owners}/>

      {transfers.length>0&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>Recent Transfers</div>
            <button onClick={()=>onNavigate("transfer-history")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:acc,fontWeight:600,padding:0}}>View All</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`1.5px solid ${bdr}`}}>
                {["Date","From","To","Sent","Received"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:h==="Sent"||h==="Received"?"right":"left",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {transfers.slice(0,5).map(t=>(
                  <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                    <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{new Date(t.transfer_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</td>
                    <td style={{padding:"9px 10px",color:txt,fontWeight:500}}>{t.from_name||"--"}</td>
                    <td style={{padding:"9px 10px",color:txt,fontWeight:500}}>{t.to_name||"--"}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:red}}>{(t.points_sent||0).toLocaleString()}</td>
                    <td style={{padding:"9px 10px",textAlign:"right",fontWeight:600,color:grn}}>{((t.points_received||0)+(t.bonus_miles||0)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// Catalog

// ── AutoTransferName ─────────────────────────────────────────────────────────
function AutoTransferName({masterId,db}){
  const [name,setName]=useState("linked program");
  useEffect(()=>{
    if(!masterId) return;
    db.from("master_programs").select().then(({data})=>{
      const found=(data||[]).find(p=>p.id===masterId);
      if(found) setName(found.name);
    });
  },[masterId]);
  return name;
}

// ── CardMilestones ────────────────────────────────────────────────────────────
function CardMilestones({masterId,db}){
  const [ms,setMs]=useState([]);
  useEffect(()=>{
    if(!masterId) return;
    db.from("master_milestones").filter("master_card_id",masterId).then(({data})=>{
      setMs((data||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)));
    });
  },[masterId]);
  if(!ms.length) return null;
  const cLbl={calendar_year:"Cal. Year",billing_year:"Billing Year",calendar_month:"Cal. Month",billing_month:"Bill. Month",lifetime:"Lifetime"};
  const tLbl={bonus_points:"Bonus Points",voucher:"Voucher",fee_waiver:"Fee Waiver",lounge:"Lounge",gift:"Gift",status_upgrade:"Status Upgrade",other:"Benefit"};
  return(
    <Card style={{marginBottom:16}}>
      <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Milestones</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {ms.map(m=>(
          <div key={m.id} style={{display:"flex",gap:14,padding:"10px 14px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`,alignItems:"flex-start"}}>
            <div style={{flexShrink:0,textAlign:"center",minWidth:64}}>
              {m.spend_threshold>0&&<div className="pv-num" style={{fontSize:12,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{"Rs."+(m.spend_threshold>=100000?(m.spend_threshold/100000).toFixed(0)+"L":m.spend_threshold>=1000?(m.spend_threshold/1000).toFixed(0)+"K":m.spend_threshold)}</div>}
              <div style={{fontSize:9,color:mut,textTransform:"uppercase",letterSpacing:"0.05em"}}>{cLbl[m.cycle_type]||m.cycle_type}</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:600,color:acc,marginBottom:2}}>{tLbl[m.benefit_type]||m.benefit_type}{m.stackable&&<span style={{fontSize:9,color:grn,marginLeft:6,fontWeight:400}}>stackable</span>}</div>
              <div style={{fontSize:11,color:txt,fontWeight:400,lineHeight:1.4}}>{m.benefit_value}</div>
              {m.benefit_points&&<div className="pv-num" style={{fontSize:11,color:grn,marginTop:2,fontWeight:600}}>+{Number(m.benefit_points).toLocaleString("en-IN")} pts</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── PartnerRow ────────────────────────────────────────────────────────────────
function PartnerRow({p,gName,gLogo}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <LogoCircle url={gLogo(p.to_type,p.to_id)} name={gName(p.to_type,p.to_id)} size={32}/>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{gName(p.to_type,p.to_id)}</div>
          {p.notes&&<div style={{fontSize:10,color:mut,marginTop:1}}>{p.notes}</div>}
        </div>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:13,fontWeight:700,color:acc,fontFamily:"'Manrope',sans-serif"}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
        {p.min_transfer&&<div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:11,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Min</div></div>}
        {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Time</div></div>}
      </div>
    </div>
  );
}

// ── CardPartnersWithImport ────────────────────────────────────────────────────
function CardPartnersWithImport({masterId,masterName,partners,gName,gLogo,db,onRefresh}){
  const [importing,setImporting]=useState(false);
  const [importDone,setImportDone]=useState(false);
  const libCard=LIBRARY.cards.find(c=>c.name.toLowerCase()===(masterName||"").toLowerCase());
  const hasMore=libCard&&libCard.partners.length>partners.length;
  const doImport=async()=>{
    if(!libCard||!masterId) return;
    setImporting(true);
    const {data:allProgs}=await db.from("master_programs").select();
    const {data:existing}=await db.from("master_partners").filter("from_id",masterId);
    const existIds=new Set((existing||[]).map(p=>p.to_id));
    for(const lp of libCard.partners){
      const libLp=LIBRARY.programs.find(x=>x.lid===lp.to_lid);
      if(!libLp) continue;
      let prog=allProgs?.find(p=>p.name.toLowerCase()===libLp.name.toLowerCase());
      if(!prog){
        const {data}=await db.from("master_programs").insert({name:libLp.name,category:libLp.category,points_currency:libLp.points_currency,inr_per_point:libLp.inr_per_point,expiry_rule:libLp.expiry_rule});
        if(data&&data[0]) prog=data[0];
      }
      if(!prog||existIds.has(prog.id)) continue;
      await db.from("master_partners").insert({from_id:masterId,from_type:"card",to_id:prog.id,to_type:"program",ratio_from:lp.ratio_from,ratio_to:lp.ratio_to,min_transfer:lp.min_transfer||null,transfer_time:lp.transfer_time||null,notes:lp.notes||null,has_reverse:false});
    }
    setImporting(false);setImportDone(true);onRefresh();
    setTimeout(()=>setImportDone(false),3000);
  };
  return(
    <Card style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>Transfer Partners</div>
        {hasMore&&!importDone&&<button style={{...gbtn,padding:"4px 12px",fontSize:11,opacity:importing?0.6:1}} onClick={doImport}>{importing?"Importing...":"Import from Library"}</button>}
        {importDone&&<span style={{fontSize:11,color:grn,fontWeight:500}}>Imported</span>}
      </div>
      {partners.length===0
        ?<div style={{fontSize:12,color:mut,textAlign:"center",padding:"12px 0"}}>No transfer partners{hasMore?" — use Import above":""}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:6}}>{partners.map(p=><PartnerRow key={p.id} p={p} gName={gName} gLogo={gLogo}/>)}</div>
      }
    </Card>
  );
}

// ── ProgPartnersWithImport ────────────────────────────────────────────────────
function ProgPartnersWithImport({masterId,masterName,partners,gName,gLogo,db,onRefresh}){
  const [importing,setImporting]=useState(false);
  const [importDone,setImportDone]=useState(false);
  const libRoutes=LIBRARY.lp_partners.filter(r=>{
    const fromLp=LIBRARY.programs.find(x=>x.lid===r.from_lid);
    return fromLp?.name?.toLowerCase()===(masterName||"").toLowerCase();
  });
  const hasMore=libRoutes.length>partners.length;
  const doImport=async()=>{
    if(!libRoutes.length||!masterId) return;
    setImporting(true);
    const {data:allProgs}=await db.from("master_programs").select();
    const {data:existing}=await db.from("master_partners").filter("from_id",masterId);
    const existIds=new Set((existing||[]).map(p=>p.to_id));
    for(const route of libRoutes){
      const toLp=LIBRARY.programs.find(p=>p.lid===route.to_lid);
      if(!toLp) continue;
      let toDbProg=allProgs?.find(p=>p.name.toLowerCase()===toLp.name.toLowerCase());
      if(!toDbProg){
        const {data}=await db.from("master_programs").insert({name:toLp.name,category:toLp.category,points_currency:toLp.points_currency,inr_per_point:toLp.inr_per_point,expiry_rule:toLp.expiry_rule});
        if(data&&data[0]) toDbProg=data[0];
      }
      if(!toDbProg||existIds.has(toDbProg.id)) continue;
      await db.from("master_partners").insert({from_id:masterId,from_type:"program",to_id:toDbProg.id,to_type:"program",ratio_from:route.ratio_from,ratio_to:route.ratio_to,min_transfer:route.min_transfer||null,transfer_time:route.transfer_time||null,notes:route.notes||null,has_reverse:false});
    }
    setImporting(false);setImportDone(true);onRefresh();
    setTimeout(()=>setImportDone(false),3000);
  };
  return(
    <Card style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>Transfer Partners</div>
        {hasMore&&!importDone&&<button style={{...gbtn,padding:"4px 12px",fontSize:11,opacity:importing?0.6:1}} onClick={doImport}>{importing?"Importing...":"Import from Library"}</button>}
        {importDone&&<span style={{fontSize:11,color:grn,fontWeight:500}}>Imported</span>}
      </div>
      {partners.length===0
        ?<div style={{fontSize:12,color:mut,textAlign:"center",padding:"12px 0"}}>No transfer partners{hasMore?" — use Import above":""}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:6}}>{partners.map(p=><PartnerRow key={p.id} p={p} gName={gName} gLogo={gLogo}/>)}</div>
      }
    </Card>
  );
}


// ── MergeMasters ─────────────────────────────────────────────────────────────
function MergeMasters({db, type, onClose, onDone}){
  const [items, setItems] = useState([]);
  const [keepId, setKeepId] = useState("");
  const [dropId, setDropId] = useState("");
  const [preview, setPreview] = useState(null); // {instances, txns, partners}
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(()=>{
    const tbl = type==="card"?"master_cards":"master_programs";
    db.from(tbl).select().then(({data})=>setItems((data||[]).sort((a,b)=>a.name.localeCompare(b.name))));
  },[db,type]);

  const instTbl = type==="card"?"my_cards":"my_programs";
  const instCol = type==="card"?"master_id":"master_id";

  useEffect(()=>{
    if(!keepId||!dropId||keepId===dropId){ setPreview(null); return; }
    (async()=>{
      const [inst, txnsAll, partners] = await Promise.all([
        db.from(instTbl).filter(instCol, dropId),
        db.from("point_transactions").select(),
        db.from("master_partners").select(),
      ]);
      const instances = inst.data||[];
      // count transactions belonging to instances of the drop master
      const instIds = new Set(instances.map(i=>i.id));
      const txnCount = (txnsAll.data||[]).filter(t=>instIds.has(t.entity_id)).length;
      const dropPartners = (partners.data||[]).filter(p=>p.from_id===dropId||p.to_id===dropId);
      const keepPartners = (partners.data||[]).filter(p=>p.from_id===keepId||p.to_id===keepId);
      // which drop partners don't exist on keep
      const keepRouteKeys = new Set(keepPartners.map(p=>p.from_id+":"+p.to_id));
      const newRoutes = dropPartners.filter(p=>{
        const key = (p.from_id===dropId?keepId:p.from_id)+":"+(p.to_id===dropId?keepId:p.to_id);
        return !keepRouteKeys.has(key);
      });
      setPreview({instances:instances.length, txns:txnCount, dropPartners:dropPartners.length, newRoutes:newRoutes.length});
    })();
  },[keepId,dropId]);

  const doMerge = async()=>{
    if(!keepId||!dropId||keepId===dropId) return;
    setBusy(true);
    const entries = [];

    // 1. Re-point all instances from drop → keep
    const {data:instances} = await db.from(instTbl).filter("master_id", dropId);
    for(const inst of (instances||[])){
      await db.from(instTbl).update(inst.id, {master_id:keepId});
      entries.push({type:"ok", msg:"Re-pointed: "+(inst.nickname||inst.membership_number||inst.id)});
    }
    if((instances||[]).length>0) entries.push({type:"ok", msg:`${instances.length} instances re-pointed to kept master`});

    // 2. Copy transfer partners from drop → keep (skip duplicates)
    const {data:allPartners} = await db.from("master_partners").select();
    const dropRoutes = (allPartners||[]).filter(p=>p.from_id===dropId||p.to_id===dropId);
    const keepRoutes = (allPartners||[]).filter(p=>p.from_id===keepId||p.to_id===keepId);
    const keepKeys = new Set(keepRoutes.map(p=>p.from_id+":"+p.to_id));
    for(const p of dropRoutes){
      const newFrom = p.from_id===dropId?keepId:p.from_id;
      const newTo   = p.to_id===dropId?keepId:p.to_id;
      if(newFrom===newTo) continue; // skip self-loops
      const key = newFrom+":"+newTo;
      if(keepKeys.has(key)) continue;
      await db.from("master_partners").insert({
        from_id:newFrom, from_type:p.from_type, to_id:newTo, to_type:p.to_type,
        ratio_from:p.ratio_from, ratio_to:p.ratio_to,
        min_transfer:p.min_transfer, transfer_time:p.transfer_time,
        notes:p.notes, has_reverse:p.has_reverse,
      });
      entries.push({type:"ok", msg:`Copied transfer route to kept master`});
    }

    // 3. Delete all old partner routes for drop master
    for(const p of dropRoutes){
      await db.from("master_partners").delete(p.id);
    }

    // 4. Delete milestones for drop master (if card)
    if(type==="card"){
      const {data:ms} = await db.from("master_milestones").filter("master_card_id", dropId);
      for(const m of (ms||[])){
        await db.from("master_milestones").delete(m.id);
      }
      if((ms||[]).length>0) entries.push({type:"ok", msg:`Removed ${ms.length} milestones from duplicate`});
    }

    // 5. Delete the drop master
    const tbl = type==="card"?"master_cards":"master_programs";
    await db.from(tbl).delete(dropId);
    entries.push({type:"ok", msg:`Deleted duplicate master`});

    setLog(entries);
    setBusy(false);
    setDone(true);
  };

  const keepItem = items.find(i=>i.id===keepId);
  const dropItem = items.find(i=>i.id===dropId);

  const selSt = {width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${bdr}`,fontSize:13,fontFamily:"'Manrope',sans-serif",background:surf,color:txt,outline:"none",marginBottom:12};

  if(done) return(
    <div>
      <div style={{fontSize:15,fontWeight:600,color:grn,marginBottom:4}}>Merge complete!</div>
      <div style={{fontSize:12,color:mut,marginBottom:16}}>{log.filter(l=>l.type==="ok").length} operations completed.</div>
      <div style={{maxHeight:180,overflowY:"auto",marginBottom:16}}>
        {log.map((l,i)=>(
          <div key={i} style={{fontSize:11,color:l.type==="ok"?grn:red,padding:"3px 0",borderBottom:`1px solid ${bdr}`}}>
            {l.type==="ok"?"✓ ":"✗ "}{l.msg}
          </div>
        ))}
      </div>
      <button style={{...pbtn,width:"100%",justifyContent:"center"}} onClick={()=>{onDone();onClose();}}>Done</button>
    </div>
  );

  return(
    <div>
      <div style={{fontSize:15,fontWeight:600,color:txt,marginBottom:4}}>Merge {type==="card"?"Master Cards":"Master Programs"}</div>
      <div style={{fontSize:12,color:mut,marginBottom:20}}>Re-points all instances and transactions from the duplicate to the keeper, copies transfer partners, then deletes the duplicate.</div>

      <div style={{marginBottom:4}}>{lbl("Keep this one (the master to keep)")}</div>
      <select value={keepId} onChange={e=>{setKeepId(e.target.value);setPreview(null);}} style={selSt}>
        <option value="">Select master to keep…</option>
        {items.filter(i=>i.id!==dropId).map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
      </select>

      <div style={{marginBottom:4}}>{lbl("Delete this duplicate")}</div>
      <select value={dropId} onChange={e=>{setDropId(e.target.value);setPreview(null);}} style={selSt}>
        <option value="">Select duplicate to delete…</option>
        {items.filter(i=>i.id!==keepId).map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
      </select>

      {keepId&&dropId&&keepId===dropId&&(
        <div style={{fontSize:12,color:red,marginBottom:12}}>Cannot merge a master with itself.</div>
      )}

      {preview&&keepId&&dropId&&keepId!==dropId&&(
        <div style={{background:surf2,borderRadius:10,padding:"14px 16px",marginBottom:16,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:11,fontWeight:600,color:txt,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em"}}>Preview</div>
          <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
            {[
              {label:"Instances re-pointed", value:preview.instances},
              {label:"Transactions kept",    value:preview.txns},
              {label:"New routes copied",    value:preview.newRoutes},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{s.value}</div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:red,marginTop:12,fontWeight:500}}>
            ⚠ "{dropItem?.name}" will be permanently deleted after merge.
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:8}}>
        <button style={gbtn} onClick={onClose}>Cancel</button>
        <button
          style={{...pbtn,background:red,border:"none",opacity:(!keepId||!dropId||keepId===dropId||busy)?0.4:1}}
          onClick={()=>(!keepId||!dropId||keepId===dropId||busy)?null:doMerge()}>
          {busy?"Merging…":"Merge & Delete Duplicate"}
        </button>
      </div>
    </div>
  );
}

// ── LibraryImport — import pre-loaded cards and programs ─────────────────────
function LibraryImport({db, onClose, onDone}){
  const [step, setStep] = useState(1); // 1=select 1.5=confirm-matches 2=review 3=importing 4=done
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [selectedProgs, setSelectedProgs] = useState(new Set());
  const [libTab, setLibTab] = useState("cards");
  const [existingCards, setExistingCards] = useState([]);
  const [existingProgsRaw, setExistingProgsRaw] = useState([]); // full objects
  const [existingCardsRaw, setExistingCardsRaw] = useState([]); // full objects
  const [importLog, setImportLog] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  // Step 1.5 state — fuzzy match confirmations
  const [fuzzyMatches, setFuzzyMatches] = useState([]); // [{libLid, libName, existingId, existingName, confirmed: null/true/false}]

  useEffect(()=>{
    (async()=>{
      const [c,p] = await Promise.all([db.from("master_cards").select(), db.from("master_programs").select()]);
      setExistingCardsRaw(c.data||[]);
      setExistingProgsRaw(p.data||[]);
      setExistingCards((c.data||[]).map(x=>x.name.toLowerCase()));
    })();
  },[db]);

  const existingProgNames = existingProgsRaw.map(x=>x.name.toLowerCase());

  // ── Matching logic ────────────────────────────────────────────────────────
  const GENERIC_WORDS = new Set(["airways","airlines","airline","rewards","miles","points","club","plus",
    "card","bank","credit","loyalty","program","programme","frequent","flyer","travel","guest","one",
    "live","limitless","member","gold","silver","platinum","international","national","air","hotel",
    "hotels","resorts","honors","bonvoy","executive","privilege","mileage","advantage","connect",
    "flying","returns","blue","klm","smiles","orchid","royal","asia","pacific","lounge","express",
    "world","global","elite","premier","select","plus","sky","wings","jet","star","alliance","team"]);

  const brandWords = name => name.toLowerCase()
    .replace(/[^a-z0-9 ]/g,"")
    .split(/\s+/)
    .filter(w=>w.length>2&&!GENERIC_WORDS.has(w));

  const matchType = (libName, existingName) => {
    const ln = libName.toLowerCase(); const en = existingName.toLowerCase();
    if(ln===en) return "exact";
    const lb = brandWords(libName); const eb = brandWords(existingName);
    if(lb.length===0||eb.length===0) return "none";
    const shared = lb.filter(w=>eb.includes(w));
    if(shared.length>0) return "fuzzy";
    return "none";
  };

  const alreadyHasCard = lid => {
    const c = LIBRARY.cards.find(x=>x.lid===lid);
    if(!c) return false;
    return existingCards.includes(c.name.toLowerCase());
  };
  const alreadyHasProg = lid => {
    const p = LIBRARY.programs.find(x=>x.lid===lid);
    if(!p) return false;
    return existingProgNames.includes(p.name.toLowerCase());
  };
  // Returns existing prog object if fuzzy match confirmed, null otherwise
  const getFuzzyMergeTarget = lid => {
    const m = fuzzyMatches.find(f=>f.libLid===lid&&f.confirmed===true);
    return m ? existingProgsRaw.find(p=>p.id===m.existingId) : null;
  };

  const depProgs = useMemo(()=>{
    const deps = new Set();
    selectedCards.forEach(lid=>{
      const card = LIBRARY.cards.find(c=>c.lid===lid);
      if(!card) return;
      if(card.auto_transfer_to) deps.add(card.auto_transfer_to);
      card.partners.forEach(p=>deps.add(p.to_lid));
    });
    return deps;
  },[selectedCards]);

  const allSelectedProgs = useMemo(()=>{
    return new Set([...depProgs,...selectedProgs]);
  },[depProgs,selectedProgs]);

  const newProgs = useMemo(()=>{
    return [...allSelectedProgs].filter(lid=>{
      if(alreadyHasProg(lid)) return false;
      // also exclude fuzzy-confirmed (they map to existing)
      if(fuzzyMatches.find(f=>f.libLid===lid&&f.confirmed===true)) return false;
      return true;
    });
  },[allSelectedProgs,existingProgNames,fuzzyMatches]);

  const lpPartners = useMemo(()=>{
    return LIBRARY.lp_partners.filter(r=>allSelectedProgs.has(r.from_lid));
  },[allSelectedProgs]);

  const toggleCard = lid => setSelectedCards(s=>{ const n=new Set(s); n.has(lid)?n.delete(lid):n.add(lid); return n; });
  const toggleProg = lid => setSelectedProgs(s=>{ const n=new Set(s); n.has(lid)?n.delete(lid):n.add(lid); return n; });

  // ── Step 1 → 1.5 transition: detect fuzzy matches ────────────────────────
  const proceedFromSelect = () => {
    if(selectedCards.size+selectedProgs.size===0) return;
    const matches = [];
    // Check selected LPs for fuzzy matches against existing programs
    for(const lid of [...allSelectedProgs]){
      if(alreadyHasProg(lid)) continue;
      const libP = LIBRARY.programs.find(p=>p.lid===lid);
      if(!libP) continue;
      for(const existing of existingProgsRaw){
        if(matchType(libP.name, existing.name)==="fuzzy"){
          matches.push({type:"program", libLid:lid, libName:libP.name, existingId:existing.id, existingName:existing.name, confirmed:null});
          break;
        }
      }
    }
    // Check selected CCs for fuzzy matches against existing master cards
    for(const lid of [...selectedCards]){
      if(alreadyHasCard(lid)) continue;
      const libC = LIBRARY.cards.find(c=>c.lid===lid);
      if(!libC) continue;
      for(const existing of existingCardsRaw){
        if(matchType(libC.name, existing.name)==="fuzzy"){
          matches.push({type:"card", libLid:lid, libName:libC.name, existingId:existing.id, existingName:existing.name, confirmed:null});
          break;
        }
      }
    }
    if(matches.length>0){ setFuzzyMatches(matches); setStep(1.5); }
    else { setFuzzyMatches([]); setStep(2); }
  };

  const confirmFuzzy = (libLid, answer) => {
    setFuzzyMatches(prev=>prev.map(f=>f.libLid===libLid?{...f,confirmed:answer}:f));
  };

  const allFuzzyAnswered = fuzzyMatches.every(f=>f.confirmed!==null);

  // ── doImport ──────────────────────────────────────────────────────────────
  const doImport = async()=>{
    setStep(3);
    const log = [];
    const progIdMap = {};

    // Load all existing programs upfront
    const {data:allProgs} = await db.from("master_programs").select();

    // Build progIdMap for exact matches
    (allProgs||[]).forEach(p=>{
      const libP = LIBRARY.programs.find(x=>x.name.toLowerCase()===p.name.toLowerCase());
      if(libP) progIdMap[libP.lid]=p.id;
    });

    // Build progIdMap for fuzzy-confirmed merges (programs)
    for(const f of fuzzyMatches.filter(f=>f.type!=="card")){
      if(f.confirmed==="keep_existing"){
        progIdMap[f.libLid]=f.existingId;
        log.push({type:"merge", msg:`Kept existing: "${f.existingName}" — will add library transfer partners`});
      } else if(f.confirmed==="keep_library"){
        // Will insert library version; need to re-point existing my_programs after insert
        log.push({type:"merge", msg:`Replacing "${f.existingName}" with library version`});
      }
    }
    // Card fuzzy merges — keep_existing: use existing card id; keep_library: will insert new
    const cardMergeKeepExisting = new Map(); // libLid → existingId
    for(const f of fuzzyMatches.filter(f=>f.type==="card")){
      if(f.confirmed==="keep_existing"){
        cardMergeKeepExisting.set(f.libLid, f.existingId);
        log.push({type:"merge", msg:`Kept existing card: "${f.existingName}"`});
      } else if(f.confirmed==="keep_library"){
        log.push({type:"merge", msg:`Replacing card "${f.existingName}" with library version`});
      }
    }

    // Insert genuinely new LPs
    for(const lid of newProgs){
      const lp = LIBRARY.programs.find(p=>p.lid===lid);
      if(!lp||progIdMap[lid]) continue;
      const {data,error} = await db.from("master_programs").insert({
        name:lp.name, category:lp.category, points_currency:lp.points_currency,
        inr_per_point:lp.inr_per_point, expiry_rule:lp.expiry_rule
      });
      if(error){ log.push({type:"error", msg:`Failed: ${lp.name} — ${error.message}`}); continue; }
      if(data&&data[0]){ progIdMap[lid]=data[0].id; log.push({type:"ok", msg:`Added LP: ${lp.name}`}); }
    }

    // Refresh progIdMap with any newly inserted
    const {data:freshProgs} = await db.from("master_programs").select();
    (freshProgs||[]).forEach(p=>{
      const libP = LIBRARY.programs.find(x=>x.name.toLowerCase()===p.name.toLowerCase());
      if(libP&&!progIdMap[libP.lid]) progIdMap[libP.lid]=p.id;
    });
    // Handle keep_library for programs: re-point my_programs from old master to new, delete old
    for(const f of fuzzyMatches.filter(f=>f.type!=="card"&&f.confirmed==="keep_library")){
      const newId = progIdMap[f.libLid];
      if(!newId) continue;
      const {data:instances} = await db.from("my_programs").filter("master_id", f.existingId);
      for(const inst of (instances||[])){
        await db.from("my_programs").update(inst.id, {master_id:newId});
      }
      if((instances||[]).length>0) log.push({type:"ok", msg:`Re-pointed ${instances.length} instance(s) from old to library master`});
      await db.from("master_programs").delete(f.existingId);
      log.push({type:"ok", msg:`Deleted old master: "${f.existingName}"`});
    }

    // Insert new CCs
    const cardIdMap = {};
    for(const lid of selectedCards){
      const card = LIBRARY.cards.find(c=>c.lid===lid);
      if(!card) continue;
      if(alreadyHasCard(lid)){
        log.push({type:"skip", msg:`${card.name} already exists (exact match)`});
        const {data:allCards} = await db.from("master_cards").select();
        const ex = (allCards||[]).find(x=>x.name.toLowerCase()===card.name.toLowerCase());
        if(ex) cardIdMap[lid]=ex.id;
        continue;
      }
      if(cardMergeKeepExisting.has(lid)){
        cardIdMap[lid]=cardMergeKeepExisting.get(lid);
        continue;
      }
      const auto_id = card.auto_transfer_to?(progIdMap[card.auto_transfer_to]||null):null;
      const {data,error} = await db.from("master_cards").insert({
        name:card.name, bank:card.bank, network:card.network,
        points_currency:card.points_currency, inr_per_point:card.inr_per_point,
        annual_fee:card.annual_fee,
        auto_transfer_to:auto_id,
        auto_transfer_ratio_from:card.auto_transfer_ratio_from||1,
        auto_transfer_ratio_to:card.auto_transfer_ratio_to||1,
      });
      if(error){ log.push({type:"error", msg:`Failed: ${card.name} — ${error.message}`}); continue; }
      if(data&&data[0]){ cardIdMap[lid]=data[0].id; log.push({type:"ok", msg:`Added CC: ${card.name}`}); }
    }

    // Insert milestones
    for(const lid of selectedCards){
      const card = LIBRARY.cards.find(c=>c.lid===lid);
      if(!card||!cardIdMap[lid]) continue;
      for(const m of (card.milestones||[])){
        await db.from("master_milestones").insert({
          master_card_id:cardIdMap[lid], spend_threshold:m.spend_threshold,
          cycle_type:m.cycle_type, benefit_type:m.benefit_type,
          benefit_value:m.benefit_value, benefit_points:m.benefit_points||null,
          stackable:m.stackable, sort_order:m.sort_order,
        });
      }
      if((card.milestones||[]).length>0) log.push({type:"ok", msg:`Added ${card.milestones.length} milestones for ${card.name}`});
    }

    // Insert CC→LP transfer partners (skip if route already exists)
    for(const lid of selectedCards){
      const card = LIBRARY.cards.find(c=>c.lid===lid);
      if(!card) continue;
      const cardDbId = cardIdMap[lid];
      if(!cardDbId) continue;
      const {data:existingRoutes} = await db.from("master_partners").filter("from_id",cardDbId);
      const existToIds = new Set((existingRoutes||[]).map(p=>p.to_id));
      let added=0;
      for(const p of (card.partners||[])){
        const toProgId = progIdMap[p.to_lid];
        if(!toProgId||existToIds.has(toProgId)) continue;
        await db.from("master_partners").insert({
          from_id:cardDbId, from_type:"card", to_id:toProgId, to_type:"program",
          ratio_from:p.ratio_from, ratio_to:p.ratio_to,
          min_transfer:p.min_transfer||null, transfer_time:p.transfer_time||null,
          notes:p.notes||null, has_reverse:false,
        });
        added++;
      }
      if(added>0) log.push({type:"ok", msg:`Added ${added} transfer routes for ${card.name}`});
    }

    // Insert LP→LP partners (skip if route already exists)
    const {data:existingLPRoutes} = await db.from("master_partners").select();
    const existingRouteKeys = new Set((existingLPRoutes||[]).map(r=>r.from_id+":"+r.to_id));
    let lpAdded=0;
    for(const r of lpPartners){
      const fromId = progIdMap[r.from_lid];
      const toId = progIdMap[r.to_lid];
      if(!fromId||!toId) continue;
      if(existingRouteKeys.has(fromId+":"+toId)) continue;
      await db.from("master_partners").insert({
        from_id:fromId, from_type:"program", to_id:toId, to_type:"program",
        ratio_from:r.ratio_from, ratio_to:r.ratio_to,
        min_transfer:r.min_transfer||null, transfer_time:r.transfer_time||null,
        notes:r.notes||null, has_reverse:false,
      });
      lpAdded++;
    }
    if(lpAdded>0) log.push({type:"ok", msg:`Added ${lpAdded} LP→LP transfer routes`});

    setImportLog(log);
    setStep(4);
  };

  const filteredCards = LIBRARY.cards.filter(c=>c.name.toLowerCase().includes(searchQ.toLowerCase())||c.bank.toLowerCase().includes(searchQ.toLowerCase()));
  const filteredProgs = LIBRARY.programs.filter(p=>p.name.toLowerCase().includes(searchQ.toLowerCase())||p.category.toLowerCase().includes(searchQ.toLowerCase()));

  const tabBtn=(t)=>({padding:"6px 14px",borderRadius:20,border:`1px solid ${libTab===t?txt:bdr}`,cursor:"pointer",fontSize:11,fontWeight:libTab===t?600:500,background:libTab===t?txt:"transparent",color:libTab===t?"#fff":mut2,fontFamily:"'Manrope',sans-serif"});

  // ── Step 1: Select ──────────────────────────────────────────────────────────
  if(step===1) return(
    <div>
      <div style={{fontSize:15,fontWeight:600,color:txt,marginBottom:4}}>Import from Library</div>
      <div style={{fontSize:12,color:mut,marginBottom:16}}>Select cards and programs to add to your catalog.</div>
      <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6}}>
          <button style={tabBtn("cards")} onClick={()=>setLibTab("cards")}>Credit Cards ({LIBRARY.cards.length})</button>
          <button style={tabBtn("programs")} onClick={()=>setLibTab("programs")}>Loyalty Programs ({LIBRARY.programs.length})</button>
        </div>
        <input style={{...inp,marginBottom:0,flex:1,minWidth:140,fontSize:12}} placeholder="Search..." value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
      </div>

      {libTab==="cards"&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:340,overflowY:"auto"}}>
          {filteredCards.map(c=>{
            const has=alreadyHasCard(c.lid);
            const sel=selectedCards.has(c.lid);
            return(
              <div key={c.lid} onClick={()=>!has&&toggleCard(c.lid)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`1px solid ${sel?txt:bdr}`,background:sel?txt+"08":has?surf2:surf,cursor:has?"not-allowed":"pointer",opacity:has?0.5:1,transition:"all 0.15s"}}>
                <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${sel?txt:bdr}`,background:sel?txt:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {sel&&<span style={{color:"#fff",fontSize:11,lineHeight:1}}>✓</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:has?mut:txt,letterSpacing:"-0.01em"}}>{c.name}</div>
                  <div style={{fontSize:10,color:mut,marginTop:1}}>{c.bank} · {c.network} · {c.partners.length} transfer partners · {(c.milestones||[]).length} milestones</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:txt}}>₹{c.annual_fee.toLocaleString("en-IN")}</div>
                  {has&&<div style={{fontSize:9,color:mut,marginTop:1}}>Already in catalog</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {libTab==="programs"&&(
        <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:340,overflowY:"auto"}}>
          {filteredProgs.map(p=>{
            const has=alreadyHasProg(p.lid);
            const sel=selectedProgs.has(p.lid);
            const isDepOf=[...selectedCards].filter(cid=>LIBRARY.cards.find(c=>c.lid===cid)?.partners.some(pt=>pt.to_lid===p.lid)||LIBRARY.cards.find(c=>c.lid===cid)?.auto_transfer_to===p.lid).map(cid=>LIBRARY.cards.find(c=>c.lid===cid)?.name);
            const isDep=isDepOf.length>0;
            return(
              <div key={p.lid} onClick={()=>!has&&toggleProg(p.lid)}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`1px solid ${isDep?acc+"55":sel?txt:bdr}`,background:isDep?acc+"06":sel?txt+"08":has?surf2:surf,cursor:has?"not-allowed":"pointer",opacity:has?0.5:1,transition:"all 0.15s"}}>
                <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${isDep?acc:sel?txt:bdr}`,background:isDep?acc:sel?txt:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {(sel||isDep)&&<span style={{color:"#fff",fontSize:11,lineHeight:1}}>✓</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:has?mut:txt,letterSpacing:"-0.01em"}}>{p.name}</div>
                  <div style={{fontSize:10,color:mut,marginTop:1}}>{p.category} · {p.points_currency} · ₹{p.inr_per_point}/pt</div>
                  {isDep&&<div style={{fontSize:9,color:acc,marginTop:2}}>Required by: {isDepOf.join(", ")}</div>}
                </div>
                {has&&<div style={{fontSize:9,color:mut,flexShrink:0}}>In catalog</div>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,paddingTop:14,borderTop:`1px solid ${bdr}`}}>
        <div style={{fontSize:12,color:mut}}>
          {selectedCards.size>0&&<span>{selectedCards.size} card{selectedCards.size>1?"s":""}</span>}
          {selectedCards.size>0&&selectedProgs.size>0&&<span> · </span>}
          {selectedProgs.size>0&&<span>{selectedProgs.size} program{selectedProgs.size>1?"s":""}</span>}
          {selectedCards.size===0&&selectedProgs.size===0&&<span>Nothing selected</span>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={gbtn} onClick={onClose}>Cancel</button>
          <button style={{...pbtn,opacity:(selectedCards.size+selectedProgs.size)===0?0.4:1}} onClick={proceedFromSelect}>Review →</button>
        </div>
      </div>
    </div>
  );

  // ── Step 1.5: Confirm fuzzy matches ─────────────────────────────────────────
  if(step===1.5) return(
    <div>
      <div style={{fontSize:15,fontWeight:600,color:txt,marginBottom:4}}>Possible Duplicates Found</div>
      <div style={{fontSize:12,color:mut,marginBottom:20}}>We found existing programs in your catalog that might be the same as library programs. Please confirm each one:</div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
        {fuzzyMatches.map((f,i)=>(
          <div key={i} style={{padding:"14px 16px",borderRadius:12,border:`1px solid ${f.confirmed===null?acc+"55":f.confirmed?grn+"55":bdr}`,background:f.confirmed===null?acc+"05":f.confirmed?grn+"05":surf2}}>
            <div style={{fontSize:11,color:mut,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500}}>Library program</div>
            <div style={{fontSize:13,fontWeight:600,color:txt,marginBottom:12}}>{f.libName}</div>
            <div style={{fontSize:11,color:mut,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500}}>Existing in your catalog</div>
            <div style={{fontSize:13,fontWeight:600,color:txt,marginBottom:14}}>{f.existingName}</div>
            <div style={{fontSize:12,color:mut,marginBottom:12}}>Are these the same program?</div>
            {f.confirmed===null?(
              <div>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <button style={{...pbtn,background:grn,border:"none",flex:1,justifyContent:"center",fontSize:11}} onClick={()=>confirmFuzzy(f.libLid,"keep_existing")}>Same — keep my version</button>
                  <button style={{...pbtn,background:acc,border:"none",flex:1,justifyContent:"center",fontSize:11}} onClick={()=>confirmFuzzy(f.libLid,"keep_library")}>Same — use library version</button>
                </div>
                <button style={{...gbtn,width:"100%",justifyContent:"center",fontSize:11}} onClick={()=>confirmFuzzy(f.libLid,false)}>Not the same — add separately</button>
              </div>
            ):(
              <div style={{fontSize:12,fontWeight:600,color:f.confirmed==="keep_existing"?grn:f.confirmed==="keep_library"?acc:mut}}>
                {f.confirmed==="keep_existing"&&"✓ Will keep your version — library transfer partners added"}
                {f.confirmed==="keep_library"&&"✓ Will replace with library version — your instances re-pointed"}
                {f.confirmed===false&&"✓ Will add as a separate program"}
                <button style={{background:"none",border:"none",cursor:"pointer",color:acc,fontSize:11,marginLeft:8}} onClick={()=>confirmFuzzy(f.libLid,null)}>Change</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <button style={gbtn} onClick={()=>setStep(1)}>← Back</button>
        <button style={{...pbtn,opacity:allFuzzyAnswered?1:0.4}} onClick={()=>allFuzzyAnswered&&setStep(2)}>Continue →</button>
      </div>
    </div>
  );

  // ── Step 2: Review ───────────────────────────────────────────────────────────
  if(step===2){
    const newCardNames=[...selectedCards].filter(l=>!alreadyHasCard(l)).map(l=>LIBRARY.cards.find(c=>c.lid===l));
    const skipCardNames=[...selectedCards].filter(l=>alreadyHasCard(l)).map(l=>LIBRARY.cards.find(c=>c.lid===l));
    const mergeProgs=fuzzyMatches.filter(f=>f.confirmed===true);
    const newProgObjs=newProgs.map(l=>LIBRARY.programs.find(p=>p.lid===l)).filter(Boolean);
    const totalPartners=[...selectedCards].reduce((a,l)=>a+(LIBRARY.cards.find(c=>c.lid===l)?.partners?.length||0),0)+lpPartners.length;
    const totalMilestones=[...selectedCards].reduce((a,l)=>a+(LIBRARY.cards.find(c=>c.lid===l)?.milestones?.length||0),0);

    return(
      <div>
        <div style={{fontSize:15,fontWeight:600,color:txt,marginBottom:4}}>Review Import</div>
        <div style={{fontSize:12,color:mut,marginBottom:16}}>The following will be added to your catalog:</div>

        {newCardNames.length>0&&(
          <div style={{marginBottom:12}}>
            {lbl("Credit Cards to Add")}
            {newCardNames.map(c=>(
              <div key={c.lid} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",background:surf2,borderRadius:8,marginBottom:4,fontSize:12}}>
                <span style={{fontWeight:600,color:txt}}>{c.name}</span>
                <span style={{color:mut}}>{c.partners.length} routes · {(c.milestones||[]).length} milestones</span>
              </div>
            ))}
          </div>
        )}

        {newProgObjs.length>0&&(
          <div style={{marginBottom:12}}>
            {lbl("New Loyalty Programs")}
            {newProgObjs.map(p=>(
              <div key={p.lid} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",background:surf2,borderRadius:8,marginBottom:4,border:`1px solid ${bdr}`,fontSize:12}}>
                <span style={{fontWeight:600,color:txt}}>{p.name}</span>
                <span style={{fontSize:10,color:mut}}>{p.category}</span>
              </div>
            ))}
          </div>
        )}

        {mergeProgs.length>0&&(
          <div style={{marginBottom:12}}>
            {lbl("Programs Being Merged (transfer partners added)")}
            {mergeProgs.map((f,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 12px",background:grn+"08",borderRadius:8,marginBottom:4,border:`1px solid ${grn}33`,fontSize:12}}>
                <span style={{fontWeight:600,color:txt}}>{f.existingName}</span>
                <span style={{fontSize:10,color:grn}}>Merge from library</span>
              </div>
            ))}
          </div>
        )}

        <div style={{background:surf2,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:20,flexWrap:"wrap"}}>
          {[
            {label:"Cards",value:newCardNames.length},
            {label:"New Programs",value:newProgObjs.length},
            {label:"Merges",value:mergeProgs.length},
            {label:"Transfer Routes",value:totalPartners},
            {label:"Milestones",value:totalMilestones},
          ].filter(s=>s.value>0).map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontSize:20,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{s.value}</div>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em"}}>{s.label}</div>
            </div>
          ))}
          {skipCardNames.length>0&&<div style={{fontSize:11,color:mut,alignSelf:"center"}}>{skipCardNames.length} already in catalog — skipped</div>}
        </div>

        <div style={{display:"flex",justifyContent:"flex-end",gap:8}}>
          <button style={gbtn} onClick={()=>fuzzyMatches.length>0?setStep(1.5):setStep(1)}>← Back</button>
          <button style={pbtn} onClick={doImport}>Import All →</button>
        </div>
      </div>
    );
  }

  if(step===3) return(
    <div style={{textAlign:"center",padding:"40px 0"}}>
      <div style={{fontSize:14,fontWeight:600,color:txt,marginBottom:8}}>Importing…</div>
      <div style={{fontSize:12,color:mut}}>Please wait while we add everything to your catalog.</div>
    </div>
  );

  if(step===4){
    const errors=importLog.filter(l=>l.type==="error");
    const added=importLog.filter(l=>l.type==="ok"||l.type==="merge");
    return(
      <div>
        <div style={{fontSize:15,fontWeight:600,color:errors.length?red:grn,marginBottom:4}}>
          {errors.length>0?"Import completed with errors":"Import complete!"}
        </div>
        <div style={{fontSize:12,color:mut,marginBottom:16}}>{added.length} operations succeeded{errors.length>0&&`, ${errors.length} failed`}.</div>
        <div style={{maxHeight:200,overflowY:"auto",marginBottom:16}}>
          {importLog.map((l,i)=>(
            <div key={i} style={{fontSize:11,color:l.type==="ok"||l.type==="merge"?grn:l.type==="skip"?mut:red,padding:"3px 0",borderBottom:`1px solid ${bdr}`}}>
              {l.type==="ok"?"✓ ":l.type==="merge"?"⟳ ":l.type==="skip"?"— ":"✗ "}{l.msg}
            </div>
          ))}
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center"}} onClick={()=>{onDone();onClose();}}>Done</button>
      </div>
    );
  }
  return null;
}


function MasterCardDetail({card, db, onBack, onEdit, onDelete}){
  const [partners,setPartners]=useState([]);
  const [inboundPartners,setInboundPartners]=useState([]);
  const [milestones,setMilestones]=useState([]);
  const [allMasters,setAllMasters]=useState({cards:[],programs:[]});
  const [busy,setBusy]=useState(true);

  useEffect(()=>{
    (async()=>{
      setBusy(true);
      const [out,inb,ms,mc,mp]=await Promise.all([
        db.from("master_partners").filter("from_id",card.id),
        db.from("master_partners").filter("to_id",card.id),
        db.from("master_milestones").filter("master_card_id",card.id),
        db.from("master_cards").select(),
        db.from("master_programs").select(),
      ]);
      setPartners((out.data||[]).sort((a,b)=>a.ratio_from/a.ratio_to-b.ratio_from/b.ratio_to));
      setInboundPartners(inb.data||[]);
      setMilestones((ms.data||[]).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)));
      setAllMasters({cards:mc.data||[],programs:mp.data||[]});
      setBusy(false);
    })();
  },[card.id]);

  const getName=(type,id)=>type==="card"?allMasters.cards.find(x=>x.id===id)?.name||"—":allMasters.programs.find(x=>x.id===id)?.name||"—";
  const getLogo=(type,id)=>type==="card"?allMasters.cards.find(x=>x.id===id)?.logo_url:allMasters.programs.find(x=>x.id===id)?.logo_url;
  const autoTransferName=card.auto_transfer_to?allMasters.programs.find(x=>x.id===card.auto_transfer_to)?.name:null;

  const cLbl={calendar_year:"Cal. Year",billing_year:"Billing Year",calendar_month:"Cal. Month",billing_month:"Bill. Month",lifetime:"Lifetime"};
  const tLbl={bonus_points:"Bonus Points",voucher:"Voucher",fee_waiver:"Fee Waiver",lounge:"Lounge",gift:"Gift",status_upgrade:"Status Upgrade",other:"Benefit"};

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:12,fontWeight:500,padding:"0 0 20px",fontFamily:"'Manrope',sans-serif"}}>← Back</button>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={onEdit}>Edit</button>
          <button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={onDelete}>Delete</button>
        </div>
      </div>

      {/* Hero */}
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:16}}>
          <LogoCircle url={card.logo_url} name={card.name} size={56}/>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>{card.name}</div>
            <div style={{fontSize:13,color:mut,marginTop:3}}>{card.bank&&card.bank+" · "}{card.network}</div>
            {autoTransferName&&<div style={{display:"flex",gap:6,alignItems:"center",marginTop:4}}>
              <span style={{fontSize:10,fontWeight:600,color:acc,background:acc+"15",padding:"2px 8px",borderRadius:20,border:`1px solid ${acc}33`}}>Co-branded</span>
              <span style={{fontSize:11,color:mut}}>Points auto-transfer to</span>
              <span style={{fontSize:11,fontWeight:700,color:txt}}>{autoTransferName}</span>
            </div>}
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {label:"Points Currency", value:card.points_currency||"pts"},
            {label:"INR / Point",      value:"₹"+(card.inr_per_point||0)},
            {label:"Annual Fee",       value:"₹"+Number(card.annual_fee||0).toLocaleString("en-IN"), color:red},
            card.fee_waiver_amt>0&&{label:"Fee Waiver",value:"₹"+Number(card.fee_waiver_amt).toLocaleString("en-IN")+" ("+( card.fee_waiver_cycle==="billing"?"Billing Yr":"Cal. Yr")+")"},
            card.billing_year_start&&{label:"Billing Yr Start",value:card.billing_year_start},
            card.fee_charge_date&&{label:"Fee Charge Date",value:card.fee_charge_date},
          ].filter(Boolean).map((s,i)=>(
            <div key={i} style={{background:surf2,borderRadius:10,padding:"10px 14px",border:`1px solid ${bdr}`}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,fontWeight:500}}>{s.label}</div>
              <div style={{fontSize:13,fontWeight:600,color:s.color||txt}}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Milestones */}
      {milestones.length>0&&(
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Milestones</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {milestones.map(m=>(
              <div key={m.id} style={{display:"flex",gap:14,padding:"10px 14px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`,alignItems:"flex-start"}}>
                <div style={{flexShrink:0,textAlign:"center",minWidth:64}}>
                  {m.spend_threshold>0&&<div className="pv-num" style={{fontSize:12,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{"₹"+(m.spend_threshold>=100000?(m.spend_threshold/100000).toFixed(0)+"L":m.spend_threshold>=1000?(m.spend_threshold/1000).toFixed(0)+"K":m.spend_threshold)}</div>}
                  <div style={{fontSize:9,color:mut,textTransform:"uppercase",letterSpacing:"0.05em"}}>{cLbl[m.cycle_type]||m.cycle_type}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:acc,marginBottom:2}}>{tLbl[m.benefit_type]||m.benefit_type}{m.stackable&&<span style={{fontSize:9,color:grn,marginLeft:6,fontWeight:400}}>stackable</span>}</div>
                  <div style={{fontSize:11,color:txt,lineHeight:1.5}}>{m.benefit_value}</div>
                  {m.benefit_points&&<div className="pv-num" style={{fontSize:11,color:grn,fontWeight:600,marginTop:2}}>+{Number(m.benefit_points).toLocaleString("en-IN")} pts</div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transfer Out */}
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Transfer Out Partners ({partners.length})</div>
        {busy?<div style={{color:mut,fontSize:12,textAlign:"center",padding:16}}>Loading…</div>:partners.length===0?<div style={{color:mut,fontSize:12,textAlign:"center",padding:"12px 0"}}>No outgoing transfer partners</div>:(
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {partners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={getLogo(p.to_type,p.to_id)} name={getName(p.to_type,p.to_id)} size={32}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{getName(p.to_type,p.to_id)}</div>
                    <div style={{fontSize:10,color:mut}}>{p.to_type==="card"?"Credit Card":"Loyalty Program"}</div>
                    {p.notes&&<div style={{fontSize:10,color:mut,marginTop:1,fontStyle:"italic"}}>{p.notes}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:13,fontWeight:700,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:11,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transfer In */}
      {inboundPartners.length>0&&(
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Transfer In (From these programs)</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {inboundPartners.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={getLogo(p.from_type,p.from_id)} name={getName(p.from_type,p.from_id)} size={32}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{getName(p.from_type,p.from_id)}</div>
                    <div style={{fontSize:10,color:mut}}>{p.from_type==="card"?"Credit Card":"Loyalty Program"}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:13,fontWeight:700,color:grn}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── MasterProgDetail ──────────────────────────────────────────────────────────
function MasterProgDetail({prog, db, onBack, onEdit, onDelete}){
  const [partners,setPartners]=useState([]);
  const [inboundPartners,setInboundPartners]=useState([]);
  const [allMasters,setAllMasters]=useState({cards:[],programs:[]});
  const [busy,setBusy]=useState(true);

  useEffect(()=>{
    (async()=>{
      setBusy(true);
      const [out,inb,mc,mp]=await Promise.all([
        db.from("master_partners").filter("from_id",prog.id),
        db.from("master_partners").filter("to_id",prog.id),
        db.from("master_cards").select(),
        db.from("master_programs").select(),
      ]);
      setPartners(out.data||[]);
      setInboundPartners(inb.data||[]);
      setAllMasters({cards:mc.data||[],programs:mp.data||[]});
      setBusy(false);
    })();
  },[prog.id]);

  const getName=(type,id)=>type==="card"?allMasters.cards.find(x=>x.id===id)?.name||"—":allMasters.programs.find(x=>x.id===id)?.name||"—";
  const getLogo=(type,id)=>type==="card"?allMasters.cards.find(x=>x.id===id)?.logo_url:allMasters.programs.find(x=>x.id===id)?.logo_url;

  const PartnerSection=({title,items,colorRatio})=>(
    items.length>0?(
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>{title} ({items.length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {items.map(p=>{
            const isOut=title.includes("Out");
            const nameId=isOut?p.to_id:p.from_id;
            const nameType=isOut?p.to_type:p.from_type;
            return(
              <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <LogoCircle url={getLogo(nameType,nameId)} name={getName(nameType,nameId)} size={32}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{getName(nameType,nameId)}</div>
                    <div style={{fontSize:10,color:mut}}>{nameType==="card"?"Credit Card":"Loyalty Program"}</div>
                    {p.notes&&<div style={{fontSize:10,color:mut,fontStyle:"italic",marginTop:1}}>{p.notes}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:13,fontWeight:700,color:colorRatio||acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                  {p.min_transfer&&<div style={{textAlign:"center"}}><div className="pv-num" style={{fontSize:11,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                  {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:9,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    ):null
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:12,fontWeight:500,padding:"0 0 20px",fontFamily:"'Manrope',sans-serif"}}>← Back</button>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={onEdit}>Edit</button>
          <button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={onDelete}>Delete</button>
        </div>
      </div>

      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",gap:16,alignItems:"center",marginBottom:16}}>
          <LogoCircle url={prog.logo_url} name={prog.name} size={56}/>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>{prog.name}</div>
            <div style={{fontSize:13,color:mut,marginTop:3}}>{prog.category}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[
            {label:"Points Currency", value:prog.points_currency||"pts"},
            {label:"INR / Point",      value:"₹"+(prog.inr_per_point||0)},
            prog.expiry_rule&&{label:"Expiry Rule",value:prog.expiry_rule},
          ].filter(Boolean).map((s,i)=>(
            <div key={i} style={{background:surf2,borderRadius:10,padding:"10px 14px",border:`1px solid ${bdr}`}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,fontWeight:500}}>{s.label}</div>
              <div style={{fontSize:13,fontWeight:600,color:txt}}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {busy?<div style={{color:mut,textAlign:"center",padding:32}}>Loading…</div>:(
        <>
          <PartnerSection title="Transfer Out Partners" items={partners} colorRatio={acc}/>
          <PartnerSection title="Transfer In Partners" items={inboundPartners} colorRatio={grn}/>
          {partners.length===0&&inboundPartners.length===0&&(
            <Card><div style={{color:mut,fontSize:12,textAlign:"center",padding:"16px 0"}}>No transfer partners configured yet</div></Card>
          )}
        </>
      )}
    </div>
  );
}


function Catalog({db}){
  const [tab,setTab]=useState("cards");
  const [mCards,setMCards]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [mParts,setMParts]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showCard,setShowCard]=useState(false);
  const [showProg,setShowProg]=useState(false);
  const [showPart,setShowPart]=useState(false);
  const [showLibrary,setShowLibrary]=useState(false);
  const [showMerge,setShowMerge]=useState(null); // null | "card" | "program"
  const [detailCard,setDetailCard]=useState(null);
  const [detailProg,setDetailProg]=useState(null);
  const [cardSearch,setCardSearch]=useState("");
  const [progSearch,setProgSearch]=useState("");
  const [partSort,setPartSort]=useState("all"); // all | out | in
  const [partSearch,setPartSearch]=useState("");
  const [saving,setSaving]=useState(false);
  const [editItem,setEditItem]=useState(null);
  const [logoFile,setLogoFile]=useState(null);
  const [logoPrev,setLogoPrev]=useState(null);
  const eCard={name:"",bank:"",network:"Visa",points_currency:"pts",inr_per_point:"",annual_fee:"",fee_waiver_amt:"",fee_waiver_cycle:"calendar",auto_transfer_to:""};
  const eProg={name:"",category:"Airline",points_currency:"pts",inr_per_point:"",expiry_rule:""};
  const ePart={from_id:"",from_type:"card",to_id:"",to_type:"program",ratio_from:"1",ratio_to:"1",min_transfer:"",max_monthly:"",transfer_time:"",notes:"",has_reverse:false,reverse_ratio_from:"1",reverse_ratio_to:"1"};
  const [fC,setFC]=useState(eCard);
  const [fP,setFP]=useState(eProg);
  const [fPt,setFPt]=useState(ePart);
  const ucC=k=>e=>setFC(p=>({...p,[k]:e.target.value}));
  const ucP=k=>e=>setFP(p=>({...p,[k]:e.target.value}));
  const ucPt=k=>e=>setFPt(p=>({...p,[k]:e.target.value}));
  const nets=["Visa","Mastercard","Amex","Diners","RuPay","Other"];
  const cats=["Airline","Hotel","Retail","Dining","Fuel","Other"];

  const load=useCallback(async()=>{
    setBusy(true);
    const [a,b,c]=await Promise.all([db.from("master_cards").select(),db.from("master_programs").select(),db.from("master_partners").select()]);
    setMCards(a.data||[]); setMProgs(b.data||[]); setMParts(c.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const upLogo=async(type,id)=>{
    if(!logoFile) return null;
    const path=`${type}/${id}-${Date.now()}.${logoFile.name.split(".").pop()}`;
    const {error,data}=await db.storage.upload("logos",path,logoFile);
    if(error){alert("Logo upload failed: "+error.message);return null;}
    return db.storage.getPublicUrl("logos",path);
  };

  const saveCard=async()=>{
    if(saving) return;
    if(!fC.name.trim()) return alert("Name required");
    const dupes=mCards.filter(c=>c.name.toLowerCase()===fC.name.trim().toLowerCase()&&(!editItem||c.id!==editItem.id));
    if(dupes.length>0) return alert("A master card named '"+fC.name.trim()+"' already exists.");
    const p={name:fC.name.trim(),bank:fC.bank,network:fC.network,points_currency:fC.points_currency,inr_per_point:parseFloat(fC.inr_per_point)||0,annual_fee:parseFloat(fC.annual_fee)||0,fee_waiver_amt:parseFloat(fC.fee_waiver_amt)||0,fee_waiver_cycle:fC.fee_waiver_cycle||"calendar",auto_transfer_to:(fC.auto_transfer_to&&fC.auto_transfer_to!=="pending")?fC.auto_transfer_to:null};
    setSaving(true);
    if(editItem){
      let logo_url=editItem.logo_url;
      if(logoFile){const u=await upLogo("cards",editItem.id);if(u) logo_url=u;}
      else if(logoPrev===null) logo_url=null;
      await db.from("master_cards").update(editItem.id,{...p,logo_url});
    } else {
      const {data}=await db.from("master_cards").insert(p);
      if(data&&data[0]&&logoFile){const u=await upLogo("cards",data[0].id);if(u) await db.from("master_cards").update(data[0].id,{logo_url:u});}
    }
    setSaving(false);
    setShowCard(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);load();
  };

  const saveProg=async()=>{
    if(!fP.name.trim()) return alert("Name required");
    const dupes=mProgs.filter(p=>p.name.toLowerCase()===fP.name.trim().toLowerCase()&&(!editItem||p.id!==editItem.id));
    if(dupes.length>0) return alert("A master program named '"+fP.name.trim()+"' already exists.");
    const p={name:fP.name.trim(),category:fP.category,points_currency:fP.points_currency||"pts",inr_per_point:parseFloat(fP.inr_per_point)||0,expiry_rule:fP.expiry_rule};
    if(editItem){
      let logo_url=editItem.logo_url;
      if(logoFile){const u=await upLogo("programs",editItem.id);if(u) logo_url=u;}
      else if(logoPrev===null) logo_url=null;
      await db.from("master_programs").update(editItem.id,{...p,logo_url});
    } else {
      const {data}=await db.from("master_programs").insert(p);
      if(data&&data[0]&&logoFile){const u=await upLogo("programs",data[0].id);if(u) await db.from("master_programs").update(data[0].id,{logo_url:u});}
    }
    setShowProg(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);load();
  };

  const savePart=async()=>{
    if(!fPt.from_id||!fPt.to_id) return alert("Select both programs");
    if(fPt.from_id===fPt.to_id&&fPt.from_type===fPt.to_type) return alert("From and To cannot be the same");
    const p={from_id:fPt.from_id,from_type:fPt.from_type,to_id:fPt.to_id,to_type:fPt.to_type,ratio_from:parseFloat(fPt.ratio_from)||1,ratio_to:parseFloat(fPt.ratio_to)||1,min_transfer:parseInt(fPt.min_transfer)||null,max_monthly:parseInt(fPt.max_monthly)||null,transfer_time:fPt.transfer_time,notes:fPt.notes,has_reverse:fPt.has_reverse||false,reverse_ratio_from:parseFloat(fPt.reverse_ratio_from)||1,reverse_ratio_to:parseFloat(fPt.reverse_ratio_to)||1};
    if(editItem) await db.from("master_partners").update(editItem.id,p);
    else await db.from("master_partners").insert(p);
    // If has_reverse, create the reverse route too
    if(!editItem&&fPt.has_reverse){
      await db.from("master_partners").insert({from_id:p.to_id,from_type:p.to_type,to_id:p.from_id,to_type:p.from_type,ratio_from:p.reverse_ratio_from,ratio_to:p.reverse_ratio_to,min_transfer:p.min_transfer,max_monthly:p.max_monthly,transfer_time:p.transfer_time,notes:p.notes,has_reverse:false,reverse_ratio_from:1,reverse_ratio_to:1});
    }
    setShowPart(false);setEditItem(null);load();
  };

  const delCard=async id=>{
    const {data:linked}=await db.from("my_cards").filter("master_id",id);
    if((linked||[]).length>0){
      const names=(linked||[]).map(c=>c.nickname||c.last4||c.id).join(", ");
      return alert(`Cannot delete — ${linked.length} linked card${linked.length>1?"s":""}: ${names}`);
    }
    if(!confirm("Delete this master card and all its transfer partner routes?")) return;
    const {data:pOut}=await db.from("master_partners").filter("from_id",id);
    const {data:pIn}=await db.from("master_partners").filter("to_id",id);
    for(const p of [...(pOut||[]),...(pIn||[])]) await db.from("master_partners").delete(p.id);
    const {data:ms}=await db.from("master_milestones").filter("master_card_id",id);
    for(const m of (ms||[])) await db.from("master_milestones").delete(m.id);
    await db.from("master_cards").delete(id);
    load();
  };
  const delProg=async id=>{
    // Check if any my_programs are linked
    const {data:linked}=await db.from("my_programs").filter("master_id",id);
    if((linked||[]).length>0){
      const names=(linked||[]).map(p=>p.nickname||p.membership_number||p.id).join(", ");
      return alert(`Cannot delete — ${linked.length} linked program${linked.length>1?"s":""}: ${names}`);
    }
    if(!confirm("Delete this master program and all its transfer partner routes?")) return;
    // Delete all master_partners where from_id or to_id = id
    const {data:pOut}=await db.from("master_partners").filter("from_id",id);
    const {data:pIn}=await db.from("master_partners").filter("to_id",id);
    for(const p of [...(pOut||[]),...(pIn||[])]) await db.from("master_partners").delete(p.id);
    await db.from("master_programs").delete(id);
    load();
  };
  const delPart=async id=>{if(confirm("Delete?")){await db.from("master_partners").delete(id);load();}};
  const gName=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.name||"--":mProgs.find(m=>m.id===id)?.name||"--";
  const gLogo=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.logo_url:mProgs.find(m=>m.id===id)?.logo_url;
  const tb=t=>({padding:"8px 18px",borderRadius:20,border:`1px solid ${tab===t?txt:bdr}`,cursor:"pointer",fontSize:11,fontWeight:tab===t?600:500,background:tab===t?txt:"transparent",color:tab===t?"#fff":mut2,transition:"all 0.15s",letterSpacing:"0.01em",fontFamily:"'Manrope',sans-serif"});

  return(
    <div>
      {detailCard&&<MasterCardDetail card={detailCard} db={db} onBack={()=>setDetailCard(null)} onEdit={()=>{setEditItem(detailCard);setFC({name:detailCard.name,bank:detailCard.bank||"",network:detailCard.network||"Visa",points_currency:detailCard.points_currency||"pts",inr_per_point:String(detailCard.inr_per_point||""),annual_fee:String(detailCard.annual_fee||""),fee_waiver_amt:String(detailCard.fee_waiver_amt||""),fee_waiver_cycle:detailCard.fee_waiver_cycle||"calendar",billing_year_start:detailCard.billing_year_start||"",fee_charge_date:detailCard.fee_charge_date||""});setLogoFile(null);setLogoPrev(detailCard.logo_url);setDetailCard(null);setShowCard(true);}} onDelete={async()=>{
              const {data:linked}=await db.from("my_cards").filter("master_id",detailCard.id);
              if((linked||[]).length>0){
                const names=(linked||[]).map(c=>c.nickname||c.last4||c.id).join(", ");
                return alert(`Cannot delete — ${linked.length} linked card${linked.length>1?"s":""}: ${names}`);
              }
              if(!confirm("Delete this master card and all its transfer routes?")) return;
              const {data:pOut}=await db.from("master_partners").filter("from_id",detailCard.id);
              const {data:pIn}=await db.from("master_partners").filter("to_id",detailCard.id);
              for(const p of [...(pOut||[]),...(pIn||[])]) await db.from("master_partners").delete(p.id);
              const {data:ms}=await db.from("master_milestones").filter("master_card_id",detailCard.id);
              for(const m of (ms||[])) await db.from("master_milestones").delete(m.id);
              await db.from("master_cards").delete(detailCard.id);
              setDetailCard(null);load();
            }}/>}
      {detailProg&&<MasterProgDetail prog={detailProg} db={db} onBack={()=>setDetailProg(null)} onEdit={()=>{setEditItem(detailProg);setFP({name:detailProg.name,category:detailProg.category||"Airline",points_currency:detailProg.points_currency||"pts",inr_per_point:String(detailProg.inr_per_point||""),expiry_rule:detailProg.expiry_rule||""});setLogoFile(null);setLogoPrev(detailProg.logo_url);setDetailProg(null);setShowProg(true);}} onDelete={async()=>{
              const {data:linked}=await db.from("my_programs").filter("master_id",detailProg.id);
              if((linked||[]).length>0){
                const names=(linked||[]).map(p=>p.nickname||p.membership_number||p.id).join(", ");
                return alert(`Cannot delete — ${linked.length} linked program${linked.length>1?"s":""}: ${names}`);
              }
              if(!confirm("Delete this master program and all its transfer routes?")) return;
              const {data:pOut}=await db.from("master_partners").filter("from_id",detailProg.id);
              const {data:pIn}=await db.from("master_partners").filter("to_id",detailProg.id);
              for(const p of [...(pOut||[]),...(pIn||[])]) await db.from("master_partners").delete(p.id);
              await db.from("master_programs").delete(detailProg.id);
              setDetailProg(null);load();
            }}/>}
      {!detailCard&&!detailProg&&<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:24,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>Master</div>
          <div style={{fontSize:13,color:mut,marginTop:5,fontWeight:400}}>Master cards, programs and transfer partners</div>
        </div>
        <button style={{...pbtn,background:acc,border:"none",gap:8}} onClick={()=>setShowLibrary(true)}>
          ✦ Import from Library
        </button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <button style={tb("cards")} onClick={()=>setTab("cards")}>Master Cards</button>
        <button style={tb("programs")} onClick={()=>setTab("programs")}>Master Programs</button>
        <button style={tb("partners")} onClick={()=>setTab("partners")}>Transfer Partners</button>
      </div>
      <Modal show={showLibrary} onClose={()=>setShowLibrary(false)} title="" wide>
        <LibraryImport db={db} onClose={()=>setShowLibrary(false)} onDone={load}/>
      </Modal>
      <Modal show={!!showMerge} onClose={()=>setShowMerge(null)} title="">
        {showMerge&&<MergeMasters db={db} type={showMerge} onClose={()=>setShowMerge(null)} onDone={load}/>}
      </Modal>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:(
        <>
        {tab==="cards"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",flex:1}}>
                <input style={{...inp,marginBottom:0,flex:1,minWidth:140,fontSize:12,padding:"6px 10px"}} placeholder="Search cards..." value={cardSearch} onChange={e=>setCardSearch(e.target.value)}/>
                <button style={{...gbtn,fontSize:12}} onClick={()=>setShowMerge("card")}>⟳ Merge</button>
                <button style={pbtn} onClick={()=>{setEditItem(null);setFC(eCard);setLogoFile(null);setLogoPrev(null);setShowCard(true);}}>+ Add</button>
              </div>
            </div>
            {(()=>{const filtMC=mCards.filter(c=>!cardSearch||c.name.toLowerCase().includes(cardSearch.toLowerCase())||(c.bank||"").toLowerCase().includes(cardSearch.toLowerCase()));return filtMC.length===0?<Empty icon="CC" msg="No master cards yet"/>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                {filtMC.map(c=>(
                  <Card key={c.id} style={{position:"relative",cursor:"pointer"}} onClick={()=>setDetailCard(c)}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <LogoCircle url={c.logo_url} name={c.name} size={40}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{c.name}</div>
                        <div style={{fontSize:11,color:mut,marginTop:2,fontWeight:400}}>{c.bank&&c.bank+" · "}{c.network}</div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:mut,fontWeight:400}}>{c.points_currency||"pts"}{c.inr_per_point>0&&" · ₹"+c.inr_per_point+"/pt"}{c.annual_fee>0&&" · ₹"+Number(c.annual_fee).toLocaleString()+" p.a."}</div>
                    {c.auto_transfer_to&&<div style={{fontSize:10,color:acc,fontWeight:500,marginTop:4}}>Co-branded · {mProgs.find(p=>p.id===c.auto_transfer_to)?.name||"Linked LP"}</div>}
                    <div style={{position:"absolute",top:12,right:12,display:"flex",gap:4}}>
                      <button style={{...gbtn,padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();setEditItem(c);setFC({name:c.name,bank:c.bank||"",network:c.network||"Visa",points_currency:c.points_currency||"pts",inr_per_point:String(c.inr_per_point||""),annual_fee:String(c.annual_fee||""),fee_waiver_amt:String(c.fee_waiver_amt||""),fee_waiver_cycle:c.fee_waiver_cycle||"calendar",auto_transfer_to:c.auto_transfer_to||""});setLogoFile(null);setLogoPrev(c.logo_url);setShowCard(true);}}>Edit</button>
                      <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();delCard(c.id);}}>Del</button>
                    </div>
                  </Card>
                ))}
              </div>
            )})()}
          </div>
        )}
        {tab==="programs"&&(
          <div>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",flex:1}}>
                <input style={{...inp,marginBottom:0,flex:1,minWidth:140,fontSize:12,padding:"6px 10px"}} placeholder="Search programs..." value={progSearch} onChange={e=>setProgSearch(e.target.value)}/>
                <button style={{...gbtn,fontSize:12}} onClick={()=>setShowMerge("program")}>⟳ Merge</button>
                <button style={pbtn} onClick={()=>{setEditItem(null);setFP(eProg);setLogoFile(null);setLogoPrev(null);setShowProg(true);}}>+ Add</button>
              </div>
            </div>
            {(()=>{const filtMP=mProgs.filter(p=>!progSearch||p.name.toLowerCase().includes(progSearch.toLowerCase())||(p.category||"").toLowerCase().includes(progSearch.toLowerCase()));return filtMP.length===0?<Empty icon="LP" msg="No master programs yet"/>:(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
                {filtMP.map(p=>(
                  <Card key={p.id} style={{position:"relative",cursor:"pointer"}} onClick={()=>setDetailProg(p)}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <LogoCircle url={p.logo_url} name={p.name} size={40}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:txt,letterSpacing:"-0.01em"}}>{p.name}</div>
                        <div style={{fontSize:11,color:mut,marginTop:2,fontWeight:400}}>{p.category}</div>
                      </div>
                    </div>
                    <div style={{fontSize:11,color:mut,fontWeight:400}}>{p.inr_per_point>0&&"₹"+p.inr_per_point+"/pt"}{p.expiry_rule&&" · "+p.expiry_rule}</div>
                    <div style={{position:"absolute",top:12,right:12,display:"flex",gap:4}}>
                      <button style={{...gbtn,padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();setEditItem(p);setFP({name:p.name,category:p.category||"Airline",points_currency:p.points_currency||"pts",inr_per_point:String(p.inr_per_point||""),expiry_rule:p.expiry_rule||""});setLogoFile(null);setLogoPrev(p.logo_url);setShowProg(true);}}>Edit</button>
                      <button style={{...dbtn,padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();delProg(p.id);}}>Del</button>
                    </div>
                  </Card>
                ))}
              </div>
            )})()}
          </div>
        )}
        {tab==="partners"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:10,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:8,flex:1,minWidth:200}}>
                <input style={{...inp,marginBottom:0,flex:1,fontSize:12}} placeholder="Search routes..." value={partSearch} onChange={e=>setPartSearch(e.target.value)}/>
                <select style={{...inp,marginBottom:0,width:"auto",fontSize:12,padding:"9px 10px"}} value={partSort} onChange={e=>setPartSort(e.target.value)}>
                  <option value="all">All</option>
                  <option value="out">Transfer Out first</option>
                  <option value="in">Transfer In first</option>
                  <option value="name">Name A-Z</option>
                  <option value="ratio">Ratio</option>
                </select>
              </div>
              <button style={pbtn} onClick={()=>{setEditItem(null);setFPt(ePart);setShowPart(true);}}>+ Add Route</button>
            </div>
            {mParts.length===0?<Empty icon="->-" msg="No transfer routes yet"/>:(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {mParts
                  .filter(p=>{
                    const fn=gName(p.from_type,p.from_id).toLowerCase();
                    const tn=gName(p.to_type,p.to_id).toLowerCase();
                    const s=partSearch.toLowerCase();
                    return !s||fn.includes(s)||tn.includes(s);
                  })
                  .sort((a,b)=>{
                    if(partSort==="out") return a.from_type==="card"?-1:b.from_type==="card"?1:0;
                    if(partSort==="in")  return a.to_type==="card"?-1:b.to_type==="card"?1:0;
                    if(partSort==="ratio") return (b.ratio_to/b.ratio_from)-(a.ratio_to/a.ratio_from);
                    return gName(a.from_type,a.from_id).localeCompare(gName(b.from_type,b.from_id));
                  })
                  .map(p=>(
                  <Card key={p.id}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <LogoCircle url={gLogo(p.from_type,p.from_id)} name={gName(p.from_type,p.from_id)} size={36}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:txt}}>{gName(p.from_type,p.from_id)}</div>
                          <div style={{fontSize:11,color:mut}}>{p.from_type==="card"?"Credit Card":"Loyalty Program"}</div>
                        </div>
                        <div style={{fontSize:16,color:mut,padding:"0 6px"}}>{"→"}</div>
                        <LogoCircle url={gLogo(p.to_type,p.to_id)} name={gName(p.to_type,p.to_id)} size={36}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:txt}}>{gName(p.to_type,p.to_id)}</div>
                          <div style={{fontSize:11,color:mut}}>{p.to_type==="card"?"Credit Card":"Loyalty Program"}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:14}}>
                        <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:acc}}>{p.ratio_from}:{p.ratio_to}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Ratio</div></div>
                        {p.min_transfer&&<div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:txt}}>{Number(p.min_transfer).toLocaleString()}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Min</div></div>}
                        {p.transfer_time&&<div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:grn}}>{p.transfer_time}</div><div style={{fontSize:10,color:mut,textTransform:"uppercase"}}>Time</div></div>}
                        <div style={{display:"flex",gap:4}}>
                          <button style={{...gbtn,padding:"5px 8px",fontSize:11}} onClick={()=>{setEditItem(p);setFPt({from_id:p.from_id,from_type:p.from_type,to_id:p.to_id,to_type:p.to_type,ratio_from:String(p.ratio_from||1),ratio_to:String(p.ratio_to||1),min_transfer:String(p.min_transfer||""),max_monthly:String(p.max_monthly||""),transfer_time:p.transfer_time||"",notes:p.notes||"",has_reverse:false,reverse_ratio_from:"1",reverse_ratio_to:"1"});setShowPart(true);}}>Edit</button>
                          <button style={{...dbtn,padding:"5px 8px",fontSize:11}} onClick={()=>delPart(p.id)}>Del</button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        </>
      )}

      </div>}
      <Modal show={showCard} onClose={()=>{setShowCard(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);}} title={editItem?"Edit Master Card":"Add Master Card"}>
        <LogoUpload current={logoPrev} onUpload={(f,p)=>{setLogoFile(f);setLogoPrev(p);}}/>
        {lbl("Card Name *")}<input style={inp} placeholder="HDFC Infinia" value={fC.name} onChange={ucC("name")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Bank")}<input style={inp} placeholder="HDFC" value={fC.bank} onChange={ucC("bank")}/></div>
          <div>{lbl("Network")}<select style={inp} value={fC.network} onChange={ucC("network")}>{nets.map(n=><option key={n}>{n}</option>)}</select></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points Unit")}<input style={inp} placeholder="pts / miles" value={fC.points_currency} onChange={ucC("points_currency")}/></div>
          <div>{lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.25" value={fC.inr_per_point} onChange={ucC("inr_per_point")}/></div>
        </div>
        {lbl("Annual Fee (Rs)")}<input style={inp} type="number" placeholder="0" value={fC.annual_fee} onChange={ucC("annual_fee")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Fee Waiver Amt (Rs)")}<input style={inp} type="number" placeholder="0" value={fC.fee_waiver_amt} onChange={ucC("fee_waiver_amt")}/></div>
          <div>{lbl("Waiver Cycle")}<select style={inp} value={fC.fee_waiver_cycle} onChange={ucC("fee_waiver_cycle")}><option value="calendar">Calendar Year</option><option value="billing">Billing Year</option></select></div>
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:txt,fontWeight:500,marginBottom:8}}>
            <input type="checkbox" checked={!!fC.auto_transfer_to} onChange={e=>ucC("auto_transfer_to")({target:{value:e.target.checked?"pending":""}})} style={{accentColor:acc,width:16,height:16}}/>
            Co-branded card (points auto-transfer to a loyalty program)
          </label>
          {!!fC.auto_transfer_to&&<select style={inp} value={fC.auto_transfer_to==="pending"?"":fC.auto_transfer_to} onChange={ucC("auto_transfer_to")}>
            <option value="">Select linked loyalty program…</option>
            {mProgs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>}
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4,opacity:saving?0.6:1}} onClick={saveCard}>{saving?"Saving...":editItem?"Save Changes":"Add Card"}</button>
      </Modal>

      <Modal show={showProg} onClose={()=>{setShowProg(false);setEditItem(null);setLogoFile(null);setLogoPrev(null);}} title={editItem?"Edit Master Program":"Add Master Program"}>
        <LogoUpload current={logoPrev} onUpload={(f,p)=>{setLogoFile(f);setLogoPrev(p);}}/>
        {lbl("Program Name *")}<input style={inp} placeholder="Air India Flying Returns" value={fP.name} onChange={ucP("name")}/>
        {lbl("Category")}<select style={inp} value={fP.category} onChange={ucP("category")}>{cats.map(c=><option key={c}>{c}</option>)}</select>
        {lbl("Points Currency")}<input style={inp} placeholder="pts / miles / points" value={fP.points_currency||"pts"} onChange={ucP("points_currency")}/>
        {lbl("INR per Point")}<input style={inp} type="number" step="0.01" placeholder="0.50" value={fP.inr_per_point} onChange={ucP("inr_per_point")}/>
        {lbl("Expiry Rule")}<input style={inp} placeholder="Points expire 3 years from earn date" value={fP.expiry_rule} onChange={ucP("expiry_rule")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4,opacity:saving?0.6:1}} onClick={saveProg}>{saving?"Saving...":editItem?"Save Changes":"Add Program"}</button>
      </Modal>

      <Modal show={showPart} onClose={()=>{setShowPart(false);setEditItem(null);}} title={editItem?"Edit Route":"Add Transfer Route"} wide>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div style={{background:acc+"08",border:`1px solid ${acc}22`,borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:acc,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>From</div>
            {lbl("Type")}<select style={inp} value={fPt.from_type} onChange={e=>setFPt(p=>({...p,from_type:e.target.value,from_id:""}))}>
              <option value="card">Credit Card</option><option value="program">Loyalty Program</option>
            </select>
            {lbl("Program")}<select style={inp} value={fPt.from_id} onChange={ucPt("from_id")}>
              <option value="">-- select --</option>
              {(fPt.from_type==="card"?mCards:mProgs).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div style={{background:grn+"08",border:`1px solid ${grn}22`,borderRadius:10,padding:14}}>
            <div style={{fontSize:10,color:grn,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>To</div>
            {lbl("Type")}<select style={inp} value={fPt.to_type} onChange={e=>setFPt(p=>({...p,to_type:e.target.value,to_id:""}))}>
              <option value="card">Credit Card</option><option value="program">Loyalty Program</option>
            </select>
            {lbl("Program")}<select style={inp} value={fPt.to_id} onChange={ucPt("to_id")}>
              <option value="">-- select --</option>
              {(fPt.to_type==="card"?mCards:mProgs).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Ratio From")}<input style={inp} type="number" step="0.1" value={fPt.ratio_from} onChange={ucPt("ratio_from")}/></div>
          <div>{lbl("Ratio To")}<input style={inp} type="number" step="0.1" value={fPt.ratio_to} onChange={ucPt("ratio_to")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Min Transfer")}<input style={inp} type="number" placeholder="1000" value={fPt.min_transfer} onChange={ucPt("min_transfer")}/></div>
          <div>{lbl("Max / Month")}<input style={inp} type="number" placeholder="none" value={fPt.max_monthly} onChange={ucPt("max_monthly")}/></div>
        </div>
        {lbl("Transfer Time")}<input style={inp} placeholder="Instant / 3-5 days" value={fPt.transfer_time} onChange={ucPt("transfer_time")}/>
        {lbl("Notes")}<input style={inp} placeholder="Any conditions" value={fPt.notes} onChange={ucPt("notes")}/>
        {!editItem&&(
          <div style={{background:surf2,border:`1px solid ${bdr}`,borderRadius:10,padding:"14px",marginBottom:12}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,color:txt,marginBottom:10}}>
              <input type="checkbox" checked={fPt.has_reverse||false} onChange={e=>setFPt(p=>({...p,has_reverse:e.target.checked}))} style={{accentColor:acc}}/>
              Also create reverse route
            </label>
            {fPt.has_reverse&&(
              <>
                <div style={{fontSize:12,color:mut,marginBottom:8}}>Reverse: {fPt.to_id?(fPt.to_type==="card"?mCards:mProgs).find(m=>m.id===fPt.to_id)?.name||"To":"To"} back to {fPt.from_id?(fPt.from_type==="card"?mCards:mProgs).find(m=>m.id===fPt.from_id)?.name||"From":"From"}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  <div>{lbl("Reverse Ratio From")}<input style={inp} type="number" step="0.1" value={fPt.reverse_ratio_from} onChange={ucPt("reverse_ratio_from")}/></div>
                  <div>{lbl("Reverse Ratio To")}<input style={inp} type="number" step="0.1" value={fPt.reverse_ratio_to} onChange={ucPt("reverse_ratio_to")}/></div>
                </div>
              </>
            )}
          </div>
        )}
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={savePart}>{editItem?"Save Changes":"Add Route"}</button>
      </Modal>
    </div>
  );
}

// MyCards
function MyCards({db,owners}){
  const [cards,setCards]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [myProgs,setMyProgs]=useState([]);
  const [mProgNames,setMProgNames]=useState({}); // master_prog_id → name
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const [search,setSearch]=useState("");
  const [ownerF,setOwnerF]=useState("all");
  const eF={master_id:"",owner_id:"",nickname:"",last4:"",opening_balance:"",stmt_date:"",card_expiry:"",fee_override:false,fee_override_value:"",billing_year_start:"",fee_charge_date:"",linked_program_id:""};
  const [f,setF]=useState(eF);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [c,m,mp,mmp]=await Promise.all([db.from("my_cards").select(),db.from("master_cards").select(),db.from("my_programs").select(),db.from("master_programs").select()]);
    setCards(c.data||[]); setMCards(m.data||[]);
    setMyProgs(mp.data||[]);
    const nameMap={};(mmp.data||[]).forEach(p=>{nameMap[p.id]=p.name;});setMProgNames(nameMap);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  if(detail){
    const master=mCards.find(m=>m.id===detail.master_id);
    const owner=owners.find(o=>o.id===detail.owner_id);
    return <CardDetail card={detail} master={master} owner={owner} db={db} mCards={mCards} owners={owners} onBack={()=>{setDetail(null);load();}} onDelete={()=>{setDetail(null);load();}}/>;
  }

  const save=async()=>{
    if(!f.master_id) return alert("Select a master card");
    if(!f.owner_id) return alert("Select an owner");
    const master=mCards.find(m=>m.id===f.master_id);
    if(master?.auto_transfer_to&&!f.linked_program_id){
      const lpName=mProgNames[master.auto_transfer_to]||"the linked loyalty program";
      return alert("This is a co-branded card linked to "+lpName+". Please add a "+lpName+" loyalty program to your account first, then come back and add this card.");
    }
    const dupes=cards.filter(c=>c.master_id===f.master_id&&c.owner_id===f.owner_id&&(!f.nickname||!c.nickname));
    if(dupes.length>0&&!f.nickname) return alert("You already have a "+master?.name+" card for this owner. Add a nickname to distinguish them, or edit the existing one.");
    const ob=parseInt(f.opening_balance)||0;
    const p={master_id:f.master_id,owner_id:f.owner_id,nickname:f.nickname,last4:f.last4,opening_balance:ob,points_balance:0,stmt_date:parseInt(f.stmt_date)||null,card_expiry:f.card_expiry||null,fee_override:f.fee_override,fee_override_value:f.fee_override?parseFloat(f.fee_override_value)||0:null,billing_year_start:f.billing_year_start||null,fee_charge_date:f.fee_charge_date||null,linked_program_id:f.linked_program_id||null};
    const {data,error}=await db.from("my_cards").insert(p);
    if(error){ alert("Failed to add card: "+JSON.stringify(error)); return; }
    const newId=data&&data[0]?.id;
    if(newId){
      const today=new Date().toISOString().split("T")[0];
      await db.from("point_transactions").insert({entity_type:"card",entity_id:newId,points:ob,description:"Opening balance",txn_date:today});
    }
    setShow(false); load();
  };

  const filtered=cards
    .filter(c=>ownerF==="all"||c.owner_id===ownerF)
    .filter(c=>{const m=mCards.find(x=>x.id===c.master_id);return(c.nickname||m?.name||"").toLowerCase().includes(search.toLowerCase())||(c.last4||"").includes(search);});

  const total=filtered.reduce((a,c)=>a+(c.points_balance||0),0);
  const totalInr=filtered.reduce((a,c)=>{const m=mCards.find(x=>x.id===c.master_id);return a+(c.points_balance||0)*(m?.inr_per_point||0);},0);

  return(
    <div>
      <Hdr title="My Cards" sub={`${filtered.length} cards · ${total.toLocaleString("en-IN")} pts${totalInr>0?" · "+inrFmt(totalInr):""}`}
        action={<button style={pbtn} onClick={()=>{setF(eF);setShow(true);}}>+ Add Card</button>}/>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:13}}>S</span>
          <input style={{...inp,marginBottom:0,paddingLeft:28}} placeholder="Search cards..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,marginBottom:0,width:"auto",padding:"9px 12px"}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
          <option value="all">All Owners</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:filtered.length===0?<Empty icon="CC" msg={search?"No cards match":"No cards yet"}/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
          {filtered.map(c=>{
            const m=mCards.find(x=>x.id===c.master_id);
            const owner=owners.find(o=>o.id===c.owner_id);
            const iv=(c.points_balance||0)*(m?.inr_per_point||0);
            const fee=c.fee_override?c.fee_override_value:m?.annual_fee;
            return(
              <div key={c.id} onClick={()=>setDetail(c)} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:18,padding:"22px 24px",cursor:"pointer",position:"relative",boxShadow:"0 1px 2px rgba(0,0,0,0.04)",transition:"box-shadow 0.2s,border-color 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.08)";e.currentTarget.style.borderColor=bdr2;}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.04)";e.currentTarget.style.borderColor=bdr;}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                  <LogoCircle url={m?.logo_url} name={m?.name} size={40}/>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>{c.nickname||m?.name}{c.last4&&<span style={{color:mut,fontWeight:400}}> ·· {c.last4}</span>}</div>
                    <div style={{fontSize:11,color:mut,marginTop:2,fontWeight:400}}>{owner?.name||""}{m?.network&&" · "+m.network}</div>
                    {m?.auto_transfer_to&&<div style={{fontSize:10,color:acc,fontWeight:600,marginTop:2}}>Co-branded · {mProgNames[m.auto_transfer_to]||"Linked LP"}</div>}
                  </div>
                </div>
                <div className="pv-num" style={{fontSize:26,fontWeight:700,color:txt,lineHeight:1,fontFamily:"'Manrope',sans-serif"}}>{(c.points_balance||0).toLocaleString("en-IN")}</div>
                <div style={{fontSize:10,color:mut,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4,marginBottom:iv>0?10:16}}>{m?.points_currency||"pts"}</div>
                {iv>0&&<div className="pv-num" style={{fontSize:13,fontWeight:600,color:grn,marginBottom:16,letterSpacing:"-0.01em"}}>{inrFmt(iv)}</div>}
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${bdr}`,paddingTop:12,fontSize:11,color:mut,fontWeight:400}}>
                  <span>{c.stmt_date?"Statement "+ordinal(c.stmt_date):""}</span>
                  <span>{fee>0?"₹"+Number(fee).toLocaleString()+" p.a.":""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title="Add Card">
        {lbl("Master Card *")}<select style={inp} value={f.master_id} onChange={up("master_id")}>
          <option value="">-- select master card --</option>
          {mCards.map(m=><option key={m.id} value={m.id}>{m.name} ({m.bank||m.network})</option>)}
        </select>
        {lbl("Owner *")}<select style={inp} value={f.owner_id} onChange={up("owner_id")}>
          <option value="">-- select owner --</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        {lbl("Nickname (optional)")}<input style={inp} placeholder="Dad's Infinia..." value={f.nickname} onChange={up("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Last 4 Digits")}<input style={inp} placeholder="4242" maxLength={4} value={f.last4} onChange={up("last4")}/></div>
          <div>{lbl("Statement Date")}<input style={inp} type="number" placeholder="15" value={f.stmt_date} onChange={up("stmt_date")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Opening Balance")}<input style={inp} type="number" placeholder="0" value={f.opening_balance} onChange={up("opening_balance")}/></div>
          <div>{lbl("Card Expiry")}<input style={inp} placeholder="MM/YY" value={f.card_expiry} onChange={up("card_expiry")}/></div>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12,fontSize:13,color:txt}}>
          <input type="checkbox" checked={f.fee_override} onChange={e=>setF(p=>({...p,fee_override:e.target.checked}))} style={{accentColor:acc,cursor:"pointer"}}/>
          Override annual fee (e.g. LTF waiver)
        </label>
        {f.fee_override&&<>{lbl("Override Fee (Rs)")}<input style={inp} type="number" placeholder="0" value={f.fee_override_value} onChange={up("fee_override_value")}/></>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Billing Year Start (MM/DD)")}<input style={inp} placeholder="04-01" value={f.billing_year_start} onChange={e=>setF(p=>({...p,billing_year_start:e.target.value.replace(/[/]/g,"-")}))}/></div>
          <div>{lbl("Fee Charge Date (MM/DD)")}<input style={inp} placeholder="06-15" value={f.fee_charge_date} onChange={e=>setF(p=>({...p,fee_charge_date:e.target.value.replace(/[/]/g,"-")}))}/></div>
        </div>
        {(()=>{
          const master=mCards.find(m=>m.id===f.master_id);
          if(!master?.auto_transfer_to) return null;
          const eligibleProgs=myProgs.filter(p=>p.master_id===master.auto_transfer_to&&(!f.owner_id||p.owner_id===f.owner_id));
          const masterProgName=mProgNames[master.auto_transfer_to]||"linked program";
          return(<div>
            {lbl("Link to "+masterProgName+" account")}
            <select style={inp} value={f.linked_program_id} onChange={up("linked_program_id")}>
              <option value="">Select your {masterProgName} account…</option>
              {eligibleProgs.map(p=><option key={p.id} value={p.id}>{p.nickname||masterProgName}{owners?.find(o=>o.id===p.owner_id)?" ("+owners.find(o=>o.id===p.owner_id).name+")":""}</option>)}
            </select>
          </div>);
        })()}
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Card</button>
      </Modal>
    </div>
  );
}

// CardDetail

// ── EditCardModal — shared edit modal used by both P&M and Spend Tracker ──────
function EditCardModal({card, db, mCards, owners, onSave, onClose}){
  const master=mCards.find(m=>m.id===card.master_id);
  const [ef,setEf]=useState({
    owner_id:card.owner_id||"",
    nickname:card.nickname||"",
    last4:card.last4||"",
    stmt_date:String(card.stmt_date||""),
    card_expiry:card.card_expiry||"",
    opening_balance:String(card.opening_balance||""),
    fee_override:card.fee_override||false,
    fee_override_value:String(card.fee_override_value||""),
    billing_year_start:card.billing_year_start||"",
    fee_charge_date:card.fee_charge_date||"",
    linked_program_id:card.linked_program_id||"",
  });
  const [mProgs,setMProgs]=useState([]);
  const [myProgs,setMyProgs]=useState([]);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    (async()=>{
      const [mp,myp]=await Promise.all([db.from("master_programs").select(),db.from("my_programs").select()]);
      setMProgs(mp.data||[]); setMyProgs(myp.data||[]);
    })();
  },[db]);

  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const save=async()=>{
    if(!ef.owner_id) return alert("Select owner");
    setSaving(true);
    const p={
      owner_id:ef.owner_id,
      nickname:ef.nickname,
      last4:ef.last4,
      stmt_date:parseInt(ef.stmt_date)||null,
      card_expiry:ef.card_expiry||null,
      opening_balance:parseInt(ef.opening_balance)||0,
      fee_override:ef.fee_override,
      fee_override_value:ef.fee_override?parseFloat(ef.fee_override_value)||0:null,
      billing_year_start:ef.billing_year_start||null,
      fee_charge_date:ef.fee_charge_date||null,
      linked_program_id:ef.linked_program_id||null,
    };
    await db.from("my_cards").update(card.id,p);
    setSaving(false);
    onSave&&onSave();
    onClose&&onClose();
  };

  return(
    <Modal show={true} onClose={onClose} title="Edit Card">
      {lbl("Owner")}<select style={inp} value={ef.owner_id} onChange={eup("owner_id")}><option value="">-- select --</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
      {lbl("Nickname")}<input style={inp} value={ef.nickname} onChange={eup("nickname")}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>{lbl("Last 4")}<input style={inp} maxLength={4} value={ef.last4} onChange={eup("last4")}/></div>
        <div>{lbl("Statement Date")}<input style={inp} type="number" value={ef.stmt_date} onChange={eup("stmt_date")}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>{lbl("Card Expiry")}<input style={inp} placeholder="MM/YY" value={ef.card_expiry} onChange={eup("card_expiry")}/></div>
        <div>{lbl("Opening Balance")}<input style={inp} type="number" value={ef.opening_balance} onChange={eup("opening_balance")}/></div>
      </div>
      <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12,fontSize:13,color:txt}}>
        <input type="checkbox" checked={ef.fee_override} onChange={e=>setEf(p=>({...p,fee_override:e.target.checked}))} style={{accentColor:acc}}/>
        Override annual fee
      </label>
      {ef.fee_override&&<>{lbl("Override Fee (Rs)")}<input style={inp} type="number" value={ef.fee_override_value} onChange={eup("fee_override_value")}/></>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>{lbl("Billing Year Start (MM/DD)")}<input style={inp} placeholder="04-01" value={ef.billing_year_start} onChange={e=>setEf(p=>({...p,billing_year_start:e.target.value.replace(/[/]/g,"-")}))}/></div>
        <div>{lbl("Fee Charge Date (MM/DD)")}<input style={inp} placeholder="06-15" value={ef.fee_charge_date} onChange={e=>setEf(p=>({...p,fee_charge_date:e.target.value.replace(/[/]/g,"-")}))}/></div>
      </div>
      {master?.auto_transfer_to&&(()=>{
        const masterProgName=mProgs.find(m=>m.id===master.auto_transfer_to)?.name||"linked program";
        const eligibleProgs=myProgs.filter(p=>p.master_id===master.auto_transfer_to)||[];
        return(<div>
          {lbl("Linked "+masterProgName+" account")}
          <select style={inp} value={ef.linked_program_id} onChange={eup("linked_program_id")}>
            <option value="">Select account…</option>
            {eligibleProgs.map(p=><option key={p.id} value={p.id}>{p.nickname||masterProgName}</option>)}
          </select>
        </div>);
      })()}
      <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4,opacity:saving?0.6:1}} onClick={save}>{saving?"Saving…":"Save Changes"}</button>
    </Modal>
  );
}

function CardDetail({card:initCard,master,owner,db,mCards,owners,onBack,onDelete}){
  const [card,setCard]=useState(initCard);
  const [txns,setTxns]=useState([]);
  const [partners,setPartners]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [myProgs,setMyProgs]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showTxn,setShowTxn]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const tf={description:"",points:"",txn_date:new Date().toISOString().split("T")[0],type:"earn"};
  const [f,setF]=useState(tf);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,par,mp,myp]=await Promise.all([
      db.from("point_transactions").filter("entity_id",card.id),
      db.from("master_partners").filter("from_id",master?.id||"x"),
      db.from("master_programs").select(),
      db.from("my_programs").select(),
    ]);
    const td=t.data||[];
    setTxns(td.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(par.data||[]);
    setMProgs(mp.data||[]);
    setMyProgs(myp.data||[]);
    const sum=td.reduce((a,t)=>a+t.points,0);
    const correct=(card.opening_balance||0)+sum;
    if(correct!==(card.points_balance||0)){
      await db.from("my_cards").update(card.id,{points_balance:correct});
      setCard(c=>({...c,points_balance:correct}));
    }
    setBusy(false);
  },[card.id,master?.id]);
  useEffect(()=>{load();},[load]);

  const saveTxn=async()=>{
    if(!f.points) return alert("Enter points");
    const pts=f.type==="redeem"?-Math.abs(parseInt(f.points)):Math.abs(parseInt(f.points));
    // Auto-transfer: if this card has auto_transfer_to, block if LP not in portfolio, else create paired txns
    if(master?.auto_transfer_to&&!f.override_auto){
      const {data:myProgs}=await db.from("my_programs").select();
      const {data:mProgsData}=await db.from("master_programs").select();
      const autoMaster=mProgsData?.find(m=>m.id===master.auto_transfer_to);
      // Use explicitly linked program first, fall back to owner match
      const linkedProg=card.linked_program_id
        ?(myProgs||[]).find(p=>p.id===card.linked_program_id)
        :(myProgs||[]).find(p=>p.master_id===master.auto_transfer_to&&p.owner_id===card.owner_id);
      if(!linkedProg){
        return alert("This co-branded card needs a linked "+( autoMaster?.name||"loyalty program")+" account. Edit the card and select which account to link.");
      }
      // Record earn on card
      await db.from("point_transactions").insert({entity_type:"card",entity_id:card.id,points:pts,description:f.description||"Earn",txn_date:f.txn_date});
      // Record auto-transfer-out on card
      const rFrom=master.auto_transfer_ratio_from||1;
      const rTo=master.auto_transfer_ratio_to||1;
      const transferredPts=Math.floor(pts*(rTo/rFrom));
      await db.from("point_transactions").insert({entity_type:"card",entity_id:card.id,points:-pts,description:"Auto-transferred to "+(linkedProg.nickname||autoMaster?.name),txn_date:f.txn_date});
      // Card balance stays 0 (earn + immediate outgoing = net 0)
      await db.from("my_cards").update(card.id,{points_balance:0});
      setCard(c=>({...c,points_balance:0}));
      // Record transfer-in on LP
      await db.from("point_transactions").insert({entity_type:"program",entity_id:linkedProg.id,points:transferredPts,description:"Auto-transferred from "+(card.nickname||master?.name),txn_date:f.txn_date});
      const newProgBal=(linkedProg.points_balance||0)+transferredPts;
      await db.from("my_programs").update(linkedProg.id,{points_balance:newProgBal});
    } else {
      await db.from("point_transactions").insert({entity_type:"card",entity_id:card.id,points:pts,description:f.description,txn_date:f.txn_date});
      const nb=(card.points_balance||0)+pts;
      await db.from("my_cards").update(card.id,{points_balance:nb});
      setCard(c=>({...c,points_balance:nb}));
    }
    setShowTxn(false);setF(tf);load();
  };

  const saveEdit=async()=>{
    if(!ef.owner_id) return alert("Select owner");
    const sum=txns.reduce((a,t)=>a+t.points,0);
    const nOp=parseInt(ef.opening_balance)||0;
    const nBal=nOp+sum;
    const p={owner_id:ef.owner_id,nickname:ef.nickname,last4:ef.last4,stmt_date:parseInt(ef.stmt_date)||null,card_expiry:ef.card_expiry||null,opening_balance:nOp,points_balance:nBal,fee_override:ef.fee_override,fee_override_value:ef.fee_override?parseFloat(ef.fee_override_value)||0:null,billing_year_start:ef.billing_year_start||null,fee_charge_date:ef.fee_charge_date||null,linked_program_id:ef.linked_program_id||null};
    await db.from("my_cards").update(card.id,p);
    setCard(c=>({...c,...p}));setShowEdit(false);
  };

  const del=async()=>{
    if(!confirm("Delete this card and all transactions?")) return;
    // Delete all point_transactions for this card
    const {data:txnRows}=await db.from("point_transactions").filter("entity_id",card.id);
    for(const t of (txnRows||[])) await db.from("point_transactions").delete(t.id);
    // Delete transfer_log entries
    const {data:tlOut}=await db.from("transfer_log").filter("from_id",card.id);
    const {data:tlIn}=await db.from("transfer_log").filter("to_id",card.id);
    for(const t of [...(tlOut||[]),...(tlIn||[])]) await db.from("transfer_log").delete(t.id);
    // Delete the card
    await db.from("my_cards").delete(card.id);
    const txnCount=(txnRows||[]).length;
    const tlCount=(tlOut||[]).length+(tlIn||[]).length;
    alert("Deleted card"+(txnCount>0?` and ${txnCount} transaction${txnCount>1?"s":""}`:"")+(tlCount>0?` and ${tlCount} transfer log entr${tlCount>1?"ies":"y"}`:"")+".");
    onDelete();
  };
  const gName=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.name||"--":mProgs.find(m=>m.id===id)?.name||"--";
  const gLogo=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.logo_url:mProgs.find(m=>m.id===id)?.logo_url;
  const ob=card.opening_balance||0;
  const iv=(card.points_balance||0)*(master?.inr_per_point||0);
  const fee=card.fee_override?card.fee_override_value:master?.annual_fee;
  const sorted=[...txns].sort((a,b)=>{
    const aIsOB=a.description==="Opening balance";
    const bIsOB=b.description==="Opening balance";
    if(aIsOB) return -1; if(bIsOB) return 1;
    return new Date(a.txn_date)-new Date(b.txn_date);
  });
  let bal=ob; const rows=sorted.map(t=>{const op=bal;bal+=t.points;return{...t,opening:op,closing:bal};}); const disp=rows.reverse();

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:12,fontWeight:500,padding:"0 0 20px",display:"flex",alignItems:"center",gap:5,fontFamily:"'Manrope',sans-serif",letterSpacing:"0.01em"}}>&#8592; Back</button>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>{setEf({owner_id:card.owner_id,nickname:card.nickname||"",last4:card.last4||"",stmt_date:String(card.stmt_date||""),card_expiry:card.card_expiry||"",opening_balance:String(card.opening_balance||""),fee_override:card.fee_override||false,fee_override_value:String(card.fee_override_value||""),billing_year_start:card.billing_year_start||"",fee_charge_date:card.fee_charge_date||"",linked_program_id:card.linked_program_id||""});setShowEdit(true);}}>Edit</button>
          <button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={del}>Delete</button>
        </div>
      </div>
      <Card style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <LogoCircle url={master?.logo_url} name={master?.name} size={56}/>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>{card.nickname||master?.name}</div>
              <div style={{fontSize:13,color:mut,marginTop:2}}>{card.last4&&".... "+card.last4+" · "}{owner?.name||"--"} · {master?.bank||""} {master?.network||""}</div>
              {master?.auto_transfer_to&&(()=>{
                const masterLPName=mProgs.find(p=>p.id===master.auto_transfer_to)?.name||"linked program";
                const myLP=myProgs.find(p=>p.id===card.linked_program_id);
                const myLPName=myLP?.nickname||masterLPName;
                return <div style={{fontSize:11,color:acc,fontWeight:500,marginTop:4,display:"flex",gap:6,alignItems:"center"}}>
                  <span style={{background:acc+"15",padding:"2px 8px",borderRadius:20,border:`1px solid ${acc}33`}}>Co-branded</span>
                  <span style={{color:mut}}>Points auto-transfer to</span>
                  <span style={{fontWeight:700,color:txt}}>{myLPName}</span>
                </div>;
              })()}
            </div>
          </div>
          <button style={pbtn} onClick={()=>{setF(tf);setShowTxn(true);}}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
          {[
            {label:"Balance",value:(card.points_balance||0).toLocaleString("en-IN")+" "+(master?.points_currency||"pts")},
            iv>0&&{label:"INR Value",value:inrFmt(iv),color:grn},
            card.stmt_date&&{label:"Statement",value:ordinal(card.stmt_date)},
            fee>0&&{label:"Annual Fee",value:"Rs"+Number(fee).toLocaleString("en-IN"),color:red},
            card.billing_year_start&&{label:"Billing Yr Start",value:card.billing_year_start},
            card.fee_charge_date&&{label:"Fee Charge Date",value:card.fee_charge_date},
          ].filter(Boolean).map((s,i)=>(
            <div key={i} style={{background:surf2,borderRadius:12,padding:"14px 18px",minWidth:110,border:`1px solid ${bdr}`}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6,fontWeight:500}}>{s.label}</div>
              <div className="pv-num" style={{fontSize:15,fontWeight:700,color:s.color||txt,fontFamily:"'Manrope',sans-serif",letterSpacing:"-0.01em"}}>{s.value}</div>
            </div>
          ))}
        </div>
      </Card>
      <CardMilestones masterId={master?.id} db={db}/>
      <CardPartnersWithImport masterId={master?.id} masterName={master?.name} partners={partners} gName={gName} gLogo={gLogo} db={db} onRefresh={load}/>
      <Card>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:16}}>Points History</div>
        {busy?<div style={{color:mut,textAlign:"center",padding:20}}>Loading...</div>:txns.length===0?<Empty msg="No transactions yet"/>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
                {["Date","Description","Points","Balance"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:h==="Date"||h==="Description"?"left":"right",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {disp.map(t=>(
                  <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                    <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{t.description==="Opening balance"?"—":new Date(t.txn_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                    <td style={{padding:"10px 12px",color:txt,fontWeight:400}}>{t.description||"—"}</td>
                    <td className="pv-num" style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:t.points>0?grn:t.points<0?red:mut}}>{t.points>0?"+":""}{t.points.toLocaleString()}</td>
                    <td className="pv-num" style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:txt}}>{t.closing.toLocaleString()}</td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {master?.auto_transfer_to&&<div style={{background:acc+"10",border:`1px solid ${acc}33`,borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:11,color:acc,fontWeight:500}}>
          Co-branded card — points auto-transfer to linked LP after logging
        </div>}
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Grocery spend, bonus..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        {master?.auto_transfer_to&&<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:12,fontSize:12,color:mut2}}>
          <input type="checkbox" checked={f.override_auto||false} onChange={e=>setF(p=>({...p,override_auto:e.target.checked}))} style={{accentColor:acc}}/>
          Override auto-transfer (log to card only)
        </label>}
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>
      {showEdit&&<EditCardModal card={card} db={db} mCards={mCards} owners={owners} onSave={()=>{load();}} onClose={()=>setShowEdit(false)}/>}
    </div>
  );
}

// MyPrograms
function MyPrograms({db,owners}){
  const [progs,setProgs]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [detail,setDetail]=useState(null);
  const [search,setSearch]=useState("");
  const [ownerF,setOwnerF]=useState("all");
  const eF={master_id:"",owner_id:"",nickname:"",membership_number:"",tier:"",opening_balance:"",expiry_date:""};
  const [f,setF]=useState(eF);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [p,m]=await Promise.all([db.from("my_programs").select(),db.from("master_programs").select()]);
    setProgs(p.data||[]); setMProgs(m.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  if(detail){
    const master=mProgs.find(m=>m.id===detail.master_id);
    const owner=owners.find(o=>o.id===detail.owner_id);
    return <ProgDetail prog={detail} master={master} owner={owner} db={db} mProgs={mProgs} mCards={[]} owners={owners} onBack={()=>{setDetail(null);load();}} onDelete={()=>{setDetail(null);load();}}/>;
  }

  const save=async()=>{
    if(!f.master_id) return alert("Select a master program");
    if(!f.owner_id) return alert("Select an owner");
    const ob=parseInt(f.opening_balance)||0;
    const {data,error}=await db.from("my_programs").insert({master_id:f.master_id,owner_id:f.owner_id,nickname:f.nickname,membership_number:f.membership_number,tier:f.tier,opening_balance:ob,points_balance:0,expiry_date:f.expiry_date||null});
    if(error){ alert("Failed to add program: "+JSON.stringify(error)); return; }
    const newId=data&&data[0]?.id;
    if(newId){
      const today=new Date().toISOString().split("T")[0];
      await db.from("point_transactions").insert({entity_type:"program",entity_id:newId,points:ob,description:"Opening balance",txn_date:today});
    }
    setShow(false);load();
  };

  const filtered=progs
    .filter(p=>ownerF==="all"||p.owner_id===ownerF)
    .filter(p=>{const m=mProgs.find(x=>x.id===p.master_id);return(p.nickname||m?.name||"").toLowerCase().includes(search.toLowerCase())||(p.membership_number||"").includes(search);});

  const totalInr=filtered.reduce((a,p)=>{const m=mProgs.find(x=>x.id===p.master_id);return a+(p.points_balance||0)*(m?.inr_per_point||0);},0);

  return(
    <div>
      <Hdr title="My Programs" sub={`${filtered.length} programs${totalInr>0?" · "+inrFmt(totalInr)+" est. value":""}`}
        action={<button style={pbtn} onClick={()=>{setF(eF);setShow(true);}}>+ Add Program</button>}/>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:13}}>S</span>
          <input style={{...inp,marginBottom:0,paddingLeft:28}} placeholder="Search programs..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,marginBottom:0,width:"auto",padding:"9px 12px"}} value={ownerF} onChange={e=>setOwnerF(e.target.value)}>
          <option value="all">All Owners</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:filtered.length===0?<Empty icon="LP" msg={search?"No programs match":"No programs yet"}/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:14}}>
          {filtered.map(p=>{
            const m=mProgs.find(x=>x.id===p.master_id);
            const owner=owners.find(o=>o.id===p.owner_id);
            const iv=(p.points_balance||0)*(m?.inr_per_point||0);
            const days=p.expiry_date?Math.round((new Date(p.expiry_date)-new Date())/86400000):null;
            const exp=days!==null&&days<=60;
            return(
              <div key={p.id} onClick={()=>setDetail(p)} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:18,padding:"22px 24px",cursor:"pointer",position:"relative",boxShadow:"0 1px 2px rgba(0,0,0,0.04)",transition:"box-shadow 0.2s,border-color 0.2s"}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.08)";e.currentTarget.style.borderColor=bdr2;}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,0.04)";e.currentTarget.style.borderColor=bdr;}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
                  <LogoCircle url={m?.logo_url} name={m?.name} size={40}/>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",letterSpacing:"-0.01em"}}>{p.nickname||m?.name}</div>
                    <div style={{fontSize:11,color:mut,marginTop:2,fontWeight:400}}>{owner?.name||""}{p.membership_number&&" · #"+p.membership_number}</div>
                  </div>
                </div>
                <div className="pv-num" style={{fontSize:26,fontWeight:700,color:txt,lineHeight:1,fontFamily:"'Manrope',sans-serif"}}>{(p.points_balance||0).toLocaleString("en-IN")}</div>
                <div style={{fontSize:10,color:mut,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4,marginBottom:iv>0?10:16}}>points</div>
                {iv>0&&<div className="pv-num" style={{fontSize:13,fontWeight:600,color:grn,marginBottom:16,letterSpacing:"-0.01em"}}>{inrFmt(iv)}</div>}
                <div style={{borderTop:`1px solid ${bdr}`,paddingTop:12,fontSize:11,color:exp?red:mut,fontWeight:400}}>
                  {p.expiry_date?(exp?"⚠ ":"")+new Date(p.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})+(days!==null?" · "+days+"d":""):""}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal show={show} onClose={()=>setShow(false)} title="Add Program">
        {lbl("Master Program *")}<select style={inp} value={f.master_id} onChange={up("master_id")}>
          <option value="">-- select master program --</option>
          {mProgs.map(m=><option key={m.id} value={m.id}>{m.name} ({m.category})</option>)}
        </select>
        {lbl("Owner *")}<select style={inp} value={f.owner_id} onChange={up("owner_id")}>
          <option value="">-- select owner --</option>
          {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        {lbl("Nickname (optional)")}<input style={inp} placeholder="My Air India..." value={f.nickname} onChange={up("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Membership Number")}<input style={inp} placeholder="XXXX-XXXX" value={f.membership_number} onChange={up("membership_number")}/></div>
          <div>{lbl("Tier")}<input style={inp} placeholder="Gold, Platinum..." value={f.tier} onChange={up("tier")}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Opening Balance")}<input style={inp} type="number" placeholder="0" value={f.opening_balance} onChange={up("opening_balance")}/></div>
          <div>{lbl("Expiry Date")}<input style={{...inp,colorScheme:"light"}} type="date" value={f.expiry_date||""} onChange={up("expiry_date")}/></div>
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>Add Program</button>
      </Modal>
    </div>
  );
}

// ProgDetail
function ProgDetail({prog:initProg,master,owner,db,mProgs,mCards,owners,onBack,onDelete}){
  const [prog,setProg]=useState(initProg);
  const [txns,setTxns]=useState([]);
  const [partners,setPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  const [showTxn,setShowTxn]=useState(false);
  const [showEdit,setShowEdit]=useState(false);
  const tf={description:"",points:"",txn_date:new Date().toISOString().split("T")[0],type:"earn"};
  const [f,setF]=useState(tf);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));
  const [ef,setEf]=useState({});
  const eup=k=>e=>setEf(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,par]=await Promise.all([
      db.from("point_transactions").filter("entity_id",prog.id),
      db.from("master_partners").filter("from_id",master?.id||"x"),
    ]);
    const td=t.data||[];
    setTxns(td.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setPartners(par.data||[]);
    const sum=td.reduce((a,t)=>a+t.points,0);
    const correct=(prog.opening_balance||0)+sum;
    if(correct!==(prog.points_balance||0)){
      await db.from("my_programs").update(prog.id,{points_balance:correct});
      setProg(p=>({...p,points_balance:correct}));
    }
    setBusy(false);
  },[prog.id,master?.id]);
  useEffect(()=>{load();},[load]);

  const saveTxn=async()=>{
    if(!f.points) return alert("Enter points");
    const pts=f.type==="redeem"?-Math.abs(parseInt(f.points)):Math.abs(parseInt(f.points));
    await db.from("point_transactions").insert({entity_type:"program",entity_id:prog.id,points:pts,description:f.description,txn_date:f.txn_date});
    const nb=(prog.points_balance||0)+pts;
    await db.from("my_programs").update(prog.id,{points_balance:nb});
    setProg(p=>({...p,points_balance:nb}));
    setShowTxn(false);setF(tf);load();
  };

  const saveEdit=async()=>{
    const sum=txns.reduce((a,t)=>a+t.points,0);
    const nOp=parseInt(ef.opening_balance)||0;
    const p={owner_id:ef.owner_id,nickname:ef.nickname,membership_number:ef.membership_number,tier:ef.tier,opening_balance:nOp,points_balance:nOp+sum,expiry_date:ef.expiry_date||null};
    await db.from("my_programs").update(prog.id,p);
    setProg(x=>({...x,...p}));setShowEdit(false);
  };

  const del=async()=>{
    if(!confirm("Delete this program?")) return;
    const {data:txnRows}=await db.from("point_transactions").filter("entity_id",prog.id);
    for(const t of (txnRows||[])) await db.from("point_transactions").delete(t.id);
    const {data:tlOut}=await db.from("transfer_log").filter("from_id",prog.id);
    const {data:tlIn}=await db.from("transfer_log").filter("to_id",prog.id);
    for(const t of [...(tlOut||[]),...(tlIn||[])]) await db.from("transfer_log").delete(t.id);
    await db.from("my_programs").delete(prog.id);
    const txnCount=(txnRows||[]).length;
    const tlCount=(tlOut||[]).length+(tlIn||[]).length;
    alert("Deleted program"+(txnCount>0?` and ${txnCount} transaction${txnCount>1?"s":""}`:"")+(tlCount>0?` and ${tlCount} transfer log entr${tlCount>1?"ies":"y"}`:"")+".");
    onDelete();
  };
  const gName=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.name||"--":mProgs.find(m=>m.id===id)?.name||"--";
  const gLogo=(type,id)=>type==="card"?mCards.find(m=>m.id===id)?.logo_url:mProgs.find(m=>m.id===id)?.logo_url;
  const ob=prog.opening_balance||0;
  const iv=(prog.points_balance||0)*(master?.inr_per_point||0);
  const days=prog.expiry_date?Math.round((new Date(prog.expiry_date)-new Date())/86400000):null;
  const exp=days!==null&&days<=60;
  const sorted=[...txns].sort((a,b)=>{
    const aIsOB=a.description==="Opening balance";
    const bIsOB=b.description==="Opening balance";
    if(aIsOB) return -1; if(bIsOB) return 1;
    return new Date(a.txn_date)-new Date(b.txn_date);
  });
  let bal=ob; const rows=sorted.map(t=>{const op=bal;bal+=t.points;return{...t,opening:op,closing:bal};}); const disp=rows.reverse();

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:12,fontWeight:500,padding:"0 0 20px",display:"flex",alignItems:"center",gap:5,fontFamily:"'Manrope',sans-serif",letterSpacing:"0.01em"}}>&#8592; Back</button>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button style={{...gbtn,padding:"6px 12px",fontSize:12}} onClick={()=>{setEf({owner_id:prog.owner_id,nickname:prog.nickname||"",membership_number:prog.membership_number||"",tier:prog.tier||"",opening_balance:String(prog.opening_balance||""),expiry_date:prog.expiry_date||""});setShowEdit(true);}}>Edit</button>
          <button style={{...dbtn,padding:"6px 12px",fontSize:12}} onClick={del}>Delete</button>
        </div>
      </div>
      <Card style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <LogoCircle url={master?.logo_url} name={master?.name} size={56}/>
            <div>
              <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em",fontFamily:"'Manrope',sans-serif"}}>{prog.nickname||master?.name}</div>
              <div style={{fontSize:13,color:mut,marginTop:2}}>{owner?.name||"--"} · {master?.category||""}{prog.tier&&" · "+prog.tier}{prog.membership_number&&" · #"+prog.membership_number}</div>
            </div>
          </div>
          <button style={pbtn} onClick={()=>{setF(tf);setShowTxn(true);}}>+ Add Transaction</button>
        </div>
        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
          {[
            {label:"Balance",value:(prog.points_balance||0).toLocaleString("en-IN")+" pts"},
            iv>0&&{label:"INR Value",value:inrFmt(iv),color:grn},
            days!==null&&{label:"Expiry",value:days>0?days+"d left":"Expired",color:exp?red:mut},
          ].filter(Boolean).map((s,i)=>(
            <div key={i} style={{background:surf2,borderRadius:12,padding:"14px 18px",minWidth:110,border:`1px solid ${bdr}`}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6,fontWeight:500}}>{s.label}</div>
              <div className="pv-num" style={{fontSize:15,fontWeight:700,color:s.color||txt,fontFamily:"'Manrope',sans-serif",letterSpacing:"-0.01em"}}>{s.value}</div>
            </div>
          ))}
        </div>
        {master?.expiry_rule&&<div style={{fontSize:12,color:mut,marginTop:10}}>{master.expiry_rule}</div>}
      </Card>
      <CardMilestones masterId={master?.id} db={db}/>
      <CardPartnersWithImport masterId={master?.id} masterName={master?.name} partners={partners} gName={gName} gLogo={gLogo} db={db} onRefresh={load}/>
      <Card>
        <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:16}}>Points History</div>
        {busy?<div style={{color:mut,textAlign:"center",padding:20}}>Loading...</div>:txns.length===0?<Empty msg="No transactions yet"/>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${bdr}`}}>
                {["Date","Description","Points","Balance"].map(h=><th key={h} style={{padding:"7px 10px",textAlign:h==="Date"||h==="Description"?"left":"right",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {disp.map(t=>(
                  <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`}}>
                    <td style={{padding:"9px 10px",color:mut,whiteSpace:"nowrap"}}>{t.description==="Opening balance"?"—":new Date(t.txn_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                    <td style={{padding:"10px 12px",color:txt,fontWeight:400}}>{t.description||"—"}</td>
                    <td className="pv-num" style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:t.points>0?grn:t.points<0?red:mut}}>{t.points>0?"+":""}{t.points.toLocaleString()}</td>
                    <td className="pv-num" style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:txt}}>{t.closing.toLocaleString()}</td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal show={showTxn} onClose={()=>setShowTxn(false)} title="Add Transaction">
        {lbl("Type")}<select style={inp} value={f.type} onChange={up("type")}><option value="earn">Earn (+ points)</option><option value="redeem">Redeem (- points)</option><option value="adjust">Adjustment</option></select>
        {lbl("Points")}<input style={inp} type="number" placeholder="1000" value={f.points} onChange={up("points")}/>
        {lbl("Description")}<input style={inp} placeholder="Flight booking, hotel..." value={f.description} onChange={up("description")}/>
        {lbl("Date")}<input style={inp} type="date" value={f.txn_date} onChange={up("txn_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveTxn}>Save Transaction</button>
      </Modal>
      <Modal show={showEdit} onClose={()=>setShowEdit(false)} title="Edit Program">
        {lbl("Owner")}<select style={inp} value={ef.owner_id||""} onChange={eup("owner_id")}><option value="">-- select --</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
        {lbl("Nickname")}<input style={inp} value={ef.nickname||""} onChange={eup("nickname")}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Membership Number")}<input style={inp} value={ef.membership_number||""} onChange={eup("membership_number")}/></div>
          <div>{lbl("Tier")}<input style={inp} value={ef.tier||""} onChange={eup("tier")}/></div>
        </div>
        {lbl("Opening Balance")}<input style={inp} type="number" value={ef.opening_balance||""} onChange={eup("opening_balance")}/>
        {lbl("Expiry Date")}<input style={{...inp,colorScheme:"light"}} type="date" value={ef.expiry_date||""} onChange={eup("expiry_date")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEdit}>Save Changes</button>
      </Modal>
    </div>
  );
}

// TransferPoints
function TransferPoints({db,owners}){
  const [myCards,setMyCards]=useState([]);
  const [myProgs,setMyProgs]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [mProgs,setMProgs]=useState([]);
  const [partners,setPartners]=useState([]);
  const [busy,setBusy]=useState(true);
  const [ownerF,setOwnerF]=useState("all");
  const [crossOwner,setCrossOwner]=useState(false);
  const [fromType,setFromType]=useState("card");
  const [fromId,setFromId]=useState("");
  const [toType,setToType]=useState("program");
  const [toId,setToId]=useState("");
  const [pts,setPts]=useState("");
  const [bonus,setBonus]=useState("");
  const [txnDate,setTxnDate]=useState(new Date().toISOString().split("T")[0]);
  const [notes,setNotes]=useState("");
  const [done,setDone]=useState(null);

  const loadAll=useCallback(async()=>{
    setBusy(true);
    const [a,b,c,d,e]=await Promise.all([db.from("my_cards").select(),db.from("my_programs").select(),db.from("master_cards").select(),db.from("master_programs").select(),db.from("master_partners").select()]);
    setMyCards(a.data||[]); setMyProgs(b.data||[]); setMCards(c.data||[]); setMProgs(d.data||[]); setPartners(e.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{loadAll();},[loadAll]);

  const gMaster=(type,masterId)=>type==="card"?mCards.find(m=>m.id===masterId):mProgs.find(m=>m.id===masterId);
  const own=id=>owners.find(o=>o.id===id)?.name||"";

  const fromEnt=fromType==="card"?myCards:myProgs;
  const fFiltered=fromEnt.filter(e=>{
    if(ownerF!=="all"&&!crossOwner&&e.owner_id!==ownerF) return false;
    const m=gMaster(fromType,e.master_id);
    return partners.some(p=>p.from_id===m?.id&&p.from_type===fromType);
  });

  const fromEntity=fromType==="card"?myCards.find(c=>c.id===fromId):myProgs.find(p=>p.id===fromId);
  const fromMaster=fromEntity?gMaster(fromType,fromEntity.master_id):null;
  const validParts=fromMaster?partners.filter(p=>p.from_id===fromMaster.id&&p.from_type===fromType):[];

  const toEnt=toType==="card"?myCards:myProgs;
  const tFiltered=toEnt.filter(e=>{
    const m=gMaster(toType,e.master_id);
    if(!validParts.some(p=>p.to_id===m?.id&&p.to_type===toType)) return false;
    if(!crossOwner&&fromEntity&&e.owner_id!==fromEntity.owner_id) return false;
    return true;
  });

  const toEntity=toType==="card"?myCards.find(c=>c.id===toId):myProgs.find(p=>p.id===toId);
  const toMaster=toEntity?gMaster(toType,toEntity.master_id):null;
  const partner=fromMaster&&toMaster?validParts.find(p=>p.to_id===toMaster.id&&p.to_type===toType):null;

  const sentPts=parseInt(pts)||0;
  const bonusPts=parseInt(bonus)||0;
  const ratioRec=partner&&sentPts?Math.floor(sentPts*(partner.ratio_to/partner.ratio_from)):0;
  const totalRec=ratioRec+bonusPts;

  const getRatio=(type,entId)=>{
    const e=type==="card"?myCards.find(c=>c.id===entId):myProgs.find(p=>p.id===entId);
    if(!e||!fromMaster) return null;
    const m=gMaster(type,e.master_id);
    const par=validParts.find(p=>p.to_id===m?.id&&p.to_type===type);
    return par?par.ratio_from+":"+par.ratio_to:null;
  };

  const doTransfer=async()=>{
    if(!fromId||!toId||!pts) return alert("Fill all fields");
    if(!partner) return alert("No transfer route found");
    if(sentPts<=0) return alert("Enter valid points");
    if(partner.min_transfer&&sentPts<partner.min_transfer) return alert("Minimum: "+partner.min_transfer.toLocaleString()+" pts");
    if(fromEntity&&sentPts>(fromEntity.points_balance||0)) return alert("Insufficient. Available: "+(fromEntity.points_balance||0).toLocaleString());
    const fTbl=fromType==="card"?"my_cards":"my_programs";
    const tTbl=toType==="card"?"my_cards":"my_programs";
    const fName=fromEntity?.nickname||fromMaster?.name||"--";
    const tName=toEntity?.nickname||toMaster?.name||"--";
    await db.from(fTbl).update(fromEntity.id,{points_balance:(fromEntity.points_balance||0)-sentPts});
    await db.from(tTbl).update(toEntity.id,{points_balance:(toEntity.points_balance||0)+totalRec});
    await db.from("point_transactions").insert({entity_type:fromType,entity_id:fromEntity.id,points:-sentPts,description:"Transfer to "+tName+(notes?" - "+notes:""),txn_date:txnDate});
    await db.from("point_transactions").insert({entity_type:toType,entity_id:toEntity.id,points:totalRec,description:"Transfer from "+fName+(bonusPts?" (+"+bonusPts+" bonus)":"")+(notes?" - "+notes:""),txn_date:txnDate});
    const logResult=await db.from("transfer_log").insert({from_type:fromType,from_id:fromEntity.id,from_owner_id:fromEntity.owner_id,to_type:toType,to_id:toEntity.id,to_owner_id:toEntity.owner_id,points_sent:sentPts,points_received:ratioRec,bonus_miles:bonusPts,ratio_from:partner.ratio_from,ratio_to:partner.ratio_to,transfer_date:txnDate,cross_owner:fromEntity.owner_id!==toEntity.owner_id,notes:notes||null,from_name:fName,to_name:tName});
    if(logResult.error) alert("Transfer logged but history save failed: "+JSON.stringify(logResult.error)+"\n\nRun in Supabase SQL: ALTER TABLE transfer_log ADD COLUMN IF NOT EXISTS from_name text; ALTER TABLE transfer_log ADD COLUMN IF NOT EXISTS to_name text;");
    setDone({fName,tName,sent:sentPts,received:ratioRec,bonus:bonusPts,total:totalRec,crossOwner:fromEntity.owner_id!==toEntity.owner_id});
    setFromId(""); setToId(""); setPts(""); setBonus(""); setNotes("");
    await loadAll();
  };

  const tBtn=(active,label,onClick)=>(
    <button onClick={onClick} style={{flex:1,padding:"7px",borderRadius:7,border:`1.5px solid ${active?txt:bdr}`,cursor:"pointer",fontSize:12,fontWeight:active?600:400,background:active?txt:"transparent",color:active?"#fff":mut,transition:"all 0.15s"}}>{label}</button>
  );

  if(busy) return <div style={{color:mut,padding:60,textAlign:"center"}}>Loading...</div>;

  return(
    <div>
      <Hdr title="Transfer Points" sub="Move points between your cards and programs"/>
      {done&&(
        <div style={{background:surf2,border:`1px solid ${bdr}`,borderRadius:10,padding:"14px 18px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
            <div>
              <div style={{fontSize:13,color:grn,fontWeight:700,marginBottom:4}}>Transfer complete!{done.crossOwner&&" (cross-owner)"}</div>
              <div style={{fontSize:13,color:txt}}>{done.sent.toLocaleString()} pts from <strong>{done.fName}</strong></div>
              <div style={{fontSize:13,color:txt,marginTop:2}}>to {done.received.toLocaleString()} pts{done.bonus>0&&<span style={{color:grn}}> + {done.bonus.toLocaleString()} bonus = <strong>{done.total.toLocaleString()}</strong></span>} in <strong>{done.tName}</strong></div>
            </div>
            <button onClick={()=>setDone(null)} style={{background:"none",border:"none",cursor:"pointer",color:mut,fontSize:20}}>x</button>
          </div>
        </div>
      )}
      <div style={{background:surf,border:`1px solid ${bdr}`,borderRadius:12,padding:24,maxWidth:600,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20,flexWrap:"wrap"}}>
          <select style={{...inp,marginBottom:0,flex:1,fontSize:12,padding:"7px 10px"}} value={ownerF} onChange={e=>{setOwnerF(e.target.value);setFromId("");setToId("");}}>
            <option value="all">All Owners</option>
            {owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:mut2,flexShrink:0}}>
            <input type="checkbox" checked={crossOwner} onChange={e=>{setCrossOwner(e.target.checked);setToId("");}} style={{accentColor:acc}}/>
            Allow cross-owner transfer
          </label>
        </div>
        {crossOwner&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:12,color:"#92400e"}}>Cross-owner transfer enabled</div>}
        <div style={{background:surf2,borderRadius:10,padding:"14px",marginBottom:14,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>From</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{lbl("Type")}<div style={{display:"flex",gap:6}}>{tBtn(fromType==="card","Credit Card",()=>{setFromType("card");setFromId("");setToId("");})}{tBtn(fromType==="program","Loyalty",()=>{setFromType("program");setFromId("");setToId("");})}</div></div>
            <div>{lbl("Program")}<select style={inp} value={fromId} onChange={e=>{setFromId(e.target.value);setToId("");}}>
              <option value="">-- select --</option>
              {fFiltered.map(e=>{const m=gMaster(fromType,e.master_id);return<option key={e.id} value={e.id}>{e.nickname||m?.name}{e.last4?" .... "+e.last4:e.membership_number?" #"+e.membership_number:""} | {own(e.owner_id)} | {(e.points_balance||0).toLocaleString()} pts</option>;})}
            </select></div>
          </div>
          {fromEntity&&<div style={{fontSize:12,color:mut}}>Available: <strong style={{color:txt}}>{(fromEntity.points_balance||0).toLocaleString()} pts</strong></div>}
        </div>
        <div style={{background:surf2,borderRadius:10,padding:"14px",marginBottom:16,border:`1px solid ${bdr}`}}>
          <div style={{fontSize:10,fontWeight:700,color:mut,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>To</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{lbl("Type")}<div style={{display:"flex",gap:6}}>{tBtn(toType==="card","Credit Card",()=>{setToType("card");setToId("");})}{tBtn(toType==="program","Loyalty",()=>{setToType("program");setToId("");})}</div></div>
            <div>{lbl("Program")}<select style={inp} value={toId} onChange={e=>setToId(e.target.value)} disabled={!fromId}>
              <option value="">-- select --</option>
              {tFiltered.map(e=>{const m=gMaster(toType,e.master_id);const ratio=getRatio(toType,e.id);return<option key={e.id} value={e.id}>{e.nickname||m?.name}{e.last4?" .... "+e.last4:e.membership_number?" #"+e.membership_number:""} | {own(e.owner_id)}{ratio?" ["+ratio+"]":""} | {(e.points_balance||0).toLocaleString()} pts</option>;})}
            </select></div>
          </div>
          {!fromId&&<div style={{fontSize:11,color:mut}}>Select source first</div>}
          {toEntity&&<div style={{fontSize:12,color:mut}}>Current: <strong style={{color:txt}}>{(toEntity.points_balance||0).toLocaleString()} pts</strong></div>}
        </div>
        {partner&&(
          <div style={{background:acc+"08",border:`1px solid ${acc}22`,borderRadius:10,padding:"12px 16px",marginBottom:16}}>
            <div style={{display:"flex",gap:20,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Ratio</div><div style={{fontSize:20,fontWeight:800,color:acc}}>{partner.ratio_from}:{partner.ratio_to}</div></div>
              {partner.min_transfer&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Min</div><div style={{fontSize:15,fontWeight:700,color:txt}}>{partner.min_transfer.toLocaleString()}</div></div>}
              {partner.max_monthly&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Max/mo</div><div style={{fontSize:15,fontWeight:700,color:txt}}>{partner.max_monthly.toLocaleString()}</div></div>}
              {partner.transfer_time&&<div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:2}}>Time</div><div style={{fontSize:15,fontWeight:700,color:grn}}>{partner.transfer_time}</div></div>}
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Points to Transfer")}<input style={inp} type="number" placeholder="Enter points" value={pts} onChange={e=>setPts(e.target.value)} disabled={!partner}/></div>
          <div>{lbl("Bonus Miles (optional)")}<input style={inp} type="number" placeholder="0" value={bonus} onChange={e=>setBonus(e.target.value)} disabled={!partner}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>{lbl("Transfer Date")}<input style={inp} type="date" value={txnDate} onChange={e=>setTxnDate(e.target.value)}/></div>
          <div>{lbl("Notes")}<input style={inp} placeholder="Promo, ref..." value={notes} onChange={e=>setNotes(e.target.value)}/></div>
        </div>
        {partner&&sentPts>0&&(
          <div style={{background:surf2,border:`1px solid ${bdr}`,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:14}}>
              <div><div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:500,letterSpacing:"0.09em",marginBottom:5}}>You Send</div><div className="pv-num" style={{fontSize:22,fontWeight:700,color:red,fontFamily:"'Manrope',sans-serif"}}>{sentPts.toLocaleString()} pts</div></div>
              <div style={{fontSize:20,color:mut}}>to</div>
              <div>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:500,letterSpacing:"0.09em",marginBottom:5}}>They Receive</div>
                <div className="pv-num" style={{fontSize:22,fontWeight:700,color:grn,fontFamily:"'Manrope',sans-serif"}}>{totalRec.toLocaleString()} pts</div>
                {bonusPts>0&&<div style={{fontSize:11,color:mut}}>{ratioRec.toLocaleString()} ratio + {bonusPts.toLocaleString()} bonus</div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,borderTop:`1px solid ${bdr}`,paddingTop:12}}>
              <div style={{background:surf,borderRadius:8,padding:"10px 12px",border:`1px solid ${bdr}`}}>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{fromEntity?.nickname||fromMaster?.name||"From"}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:mut}}>Before:</span><span style={{fontWeight:600,color:txt}}>{(fromEntity?.points_balance||0).toLocaleString()}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:3}}>
                  <span style={{color:mut}}>After:</span><span style={{fontWeight:700,color:red}}>{((fromEntity?.points_balance||0)-sentPts).toLocaleString()}</span>
                </div>
              </div>
              <div style={{background:surf,borderRadius:8,padding:"10px 12px",border:`1px solid ${bdr}`}}>
                <div style={{fontSize:10,color:mut,textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{toEntity?.nickname||toMaster?.name||"To"}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12}}>
                  <span style={{color:mut}}>Before:</span><span style={{fontWeight:600,color:txt}}>{(toEntity?.points_balance||0).toLocaleString()}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginTop:3}}>
                  <span style={{color:mut}}>After:</span><span style={{fontWeight:700,color:grn}}>{((toEntity?.points_balance||0)+totalRec).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <button style={{...pbtn,width:"100%",justifyContent:"center",padding:"11px",opacity:(!fromId||!toId||!pts)?0.5:1}} onClick={doTransfer}>Transfer Points</button>
      </div>
    </div>
  );
}

// TransferHistory
function TransferHistory({db,owners}){
  const [logs,setLogs]=useState([]);
  const [busy,setBusy]=useState(true);
  const [err,setErr]=useState("");
  const [search,setSearch]=useState("");
  const [sort,setSort]=useState("date");
  const [detail,setDetail]=useState(null);

  const load=useCallback(async()=>{
    setBusy(true);setErr("");
    try{
      const {data,error}=await db.from("transfer_log").select();
      if(error){setErr("Load error: "+JSON.stringify(error));setLogs([]);}
      else setLogs((data||[]).sort((a,b)=>new Date(b.transfer_date)-new Date(a.transfer_date)));
    }catch(e){setErr("Exception: "+e.message);}
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const del=async id=>{if(!confirm("Delete this record?")) return;await db.from("transfer_log").delete(id);load();};

  const filtered=logs
    .filter(l=>(l.from_name||"").toLowerCase().includes(search.toLowerCase())||(l.to_name||"").toLowerCase().includes(search.toLowerCase())||(l.notes||"").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>sort==="sent"?b.points_sent-a.points_sent:sort==="received"?b.points_received-a.points_received:new Date(b.transfer_date)-new Date(a.transfer_date));

  const tSent=filtered.reduce((a,l)=>a+(l.points_sent||0),0);
  const tRec=filtered.reduce((a,l)=>a+(l.points_received||0)+(l.bonus_miles||0),0);

  return(
    <div>
      <Hdr title="Transfer History" sub="All point transfers"/>
      {err&&<div style={{color:red,fontSize:12,padding:"10px 14px",background:"#fef2f2",borderRadius:8,marginBottom:16}}>{err}</div>}
      {logs.length>0&&(
        <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          {[{label:"Total Transfers",value:String(logs.length)},{label:"Total Sent",value:tSent.toLocaleString(),color:red},{label:"Total Received",value:tRec.toLocaleString(),color:grn}].map((s,i)=>(
            <div key={i} style={{background:surf,border:`1px solid ${bdr}`,borderRadius:10,padding:"12px 16px",minWidth:120}}>
              <div style={{fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,fontWeight:600}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color||txt}}>{s.value}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{position:"relative",flex:1,minWidth:160}}>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:mut,fontSize:13}}>S</span>
          <input style={{...inp,marginBottom:0,paddingLeft:28}} placeholder="Search transfers..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select style={{...inp,marginBottom:0,width:"auto",padding:"9px 12px"}} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="date">Date</option><option value="sent">Sent</option><option value="received">Received</option>
        </select>
      </div>
      {busy?<div style={{color:mut,textAlign:"center",padding:40}}>Loading...</div>:filtered.length===0?<Empty icon="->" msg="No transfers yet"/>:(
        <Card>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{color:mut,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${bdr}`}}>
                {["Date","From","To","Sent","Ratio","Received","Bonus",""].map(h=><th key={h} style={{padding:"8px 12px",textAlign:h==="Sent"||h==="Received"||h==="Bonus"?"right":"left",fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filtered.map(l=>(
                  <tr key={l.id} style={{borderBottom:`1px solid ${bdr}`,cursor:"pointer"}} onClick={()=>setDetail(detail?.id===l.id?null:l)}>
                    <td style={{padding:"10px 12px",color:mut,whiteSpace:"nowrap"}}>{new Date(l.transfer_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}{l.cross_owner&&<span style={{marginLeft:6,fontSize:10,color:acc,fontWeight:600}}>cross</span>}</td>
                    <td style={{padding:"10px 12px",fontWeight:500,color:txt}}>{l.from_name||"--"}</td>
                    <td style={{padding:"10px 12px",fontWeight:500,color:txt}}>{l.to_name||"--"}</td>
                    <td className="pv-num" style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:red}}>{(l.points_sent||0).toLocaleString()}</td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}><span style={{fontSize:11,fontWeight:700,color:acc,background:acc+"12",padding:"2px 7px",borderRadius:20}}>{l.ratio_from}:{l.ratio_to}</span></td>
                    <td className="pv-num" style={{padding:"10px 12px",textAlign:"right",fontWeight:600,color:grn}}>{(l.points_received||0).toLocaleString()}</td>
                    <td style={{padding:"10px 12px",textAlign:"right",color:l.bonus_miles>0?acc:mut}}>{l.bonus_miles>0?"+"+l.bonus_miles.toLocaleString():"--"}</td>
                    <td style={{padding:"10px 12px",textAlign:"center"}}><button style={{...dbtn,padding:"3px 7px",fontSize:11}} onClick={e=>{e.stopPropagation();del(l.id);}}>x</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {detail&&(
            <div style={{background:surf2,borderTop:`1px solid ${bdr}`,padding:"12px 16px"}}>
              <div style={{display:"flex",gap:20,flexWrap:"wrap",fontSize:13}}>
                <div><span style={{color:mut,fontSize:11}}>Date: </span>{new Date(detail.transfer_date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
                {detail.notes&&<div><span style={{color:mut,fontSize:11}}>Notes: </span>{detail.notes}</div>}
                <div><span style={{color:mut,fontSize:11}}>Total received: </span><strong style={{color:grn}}>{((detail.points_received||0)+(detail.bonus_miles||0)).toLocaleString()}</strong></div>
                {detail.cross_owner&&<div style={{color:acc,fontWeight:600}}>Cross-owner transfer</div>}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Vouchers

function Secret({onConnect}){
  const [url,setUrl]=useState(localStorage.getItem("pv_u")||"");
  const [key,setKey]=useState(localStorage.getItem("pv_k")||"");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);

  const connect=async()=>{
    if(!url.trim()||!key.trim()) return setErr("Both fields required");
    setBusy(true); setErr("");
    try{
      const c=createClient(url.trim(),key.trim());
      const {error}=await c.from("owners").select();
      if(error) throw error;
      localStorage.setItem("pv_u",url.trim());
      localStorage.setItem("pv_k",key.trim());
      onConnect(url.trim(),key.trim());
    }catch(e){
      setErr("Connection failed: "+(e.message||"check your URL and key"));
    }
    setBusy(false);
  };

  return(
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Supabase URL</div>
        <input style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${bdr}`,fontSize:13,fontFamily:"'Manrope',sans-serif",background:surf,color:txt,outline:"none",boxSizing:"border-box"}}
          placeholder="https://xxxx.supabase.co" value={url} onChange={e=>setUrl(e.target.value)}/>
      </div>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Anon Key</div>
        <input type="password" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${bdr}`,fontSize:13,fontFamily:"'Manrope',sans-serif",background:surf,color:txt,outline:"none",boxSizing:"border-box"}}
          placeholder="eyJhbGc..." value={key} onChange={e=>setKey(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&connect()}/>
      </div>
      {err&&<div style={{fontSize:12,color:red,marginBottom:12}}>{err}</div>}
      <button onClick={connect} disabled={busy}
        style={{width:"100%",padding:"12px",borderRadius:10,background:txt,color:surf,border:"none",cursor:busy?"not-allowed":"pointer",fontSize:13,fontWeight:600,fontFamily:"'Manrope',sans-serif",opacity:busy?0.7:1}}>
        {busy?"Connecting…":"Connect to Supabase"}
      </button>
    </div>
  );
}

function Vouchers({db,owners}){
  const [rows,setRows]=useState([]);
  const [busy,setBusy]=useState(true);
  const [show,setShow]=useState(false);
  const [edit,setEdit]=useState(null);
  const eF={owner_id:"",title:"",code:"",expiry:"",value:"",notes:""};
  const [f,setF]=useState(eF);
  const up=k=>e=>setF(p=>({...p,[k]:e.target.value}));

  const load=useCallback(async()=>{
    setBusy(true);
    const {data}=await db.from("vouchers").select();
    setRows((data||[]).sort((a,b)=>new Date(a.expiry||"2099")-new Date(b.expiry||"2099")));
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const save=async()=>{
    if(!f.title.trim()) return alert("Title required");
    const p={owner_id:f.owner_id||null,title:f.title.trim(),code:f.code.trim(),expiry:f.expiry||null,value:parseFloat(f.value)||null,notes:f.notes.trim()};
    if(edit){await db.from("vouchers").update(edit.id,p);}
    else{await db.from("vouchers").insert(p);}
    setShow(false);setEdit(null);setF(eF);load();
  };
  const del=async id=>{if(!confirm("Delete voucher?")) return;await db.from("vouchers").delete(id);load();};
  const openEdit=v=>{setEdit(v);setF({owner_id:v.owner_id||"",title:v.title||"",code:v.code||"",expiry:v.expiry||"",value:String(v.value||""),notes:v.notes||""});setShow(true);};

  const today=new Date().toISOString().split("T")[0];
  const expired=v=>v.expiry&&v.expiry<today;

  return(
    <div>
      <Hdr title="Vouchers" sub={`${rows.filter(v=>!expired(v)).length} active`}
        action={<button style={pbtn} onClick={()=>{setEdit(null);setF(eF);setShow(true);}}>+ Add Voucher</button>}/>
      {busy?<div style={{color:mut,fontSize:13}}>Loading…</div>:rows.length===0?<Empty icon="V" msg="No vouchers yet"/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {rows.map(v=>(
            <Card key={v.id} style={{opacity:expired(v)?0.5:1,position:"relative"}}>
              {expired(v)&&<div style={{position:"absolute",top:12,right:12,fontSize:9,fontWeight:600,color:red,textTransform:"uppercase",letterSpacing:"0.07em",background:red+"15",padding:"2px 8px",borderRadius:10}}>Expired</div>}
              <div style={{fontSize:14,fontWeight:700,color:txt,marginBottom:4,letterSpacing:"-0.01em"}}>{v.title}</div>
              {v.code&&<div style={{fontSize:12,fontFamily:"monospace",background:surf2,padding:"4px 8px",borderRadius:6,color:txt,marginBottom:6,display:"inline-block"}}>{v.code}</div>}
              <div style={{fontSize:12,color:mut,marginBottom:2}}>{owners.find(o=>o.id===v.owner_id)?.name||"—"}</div>
              {v.value&&<div style={{fontSize:13,fontWeight:600,color:grn,marginBottom:2}}>{inrFmt(v.value)}</div>}
              {v.expiry&&<div style={{fontSize:11,color:expired(v)?red:mut,marginBottom:2}}>Expires: {new Date(v.expiry).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>}
              {v.notes&&<div style={{fontSize:11,color:mut,marginTop:4}}>{v.notes}</div>}
              <div style={{display:"flex",gap:6,marginTop:12}}>
                <button style={{...gbtn,fontSize:11,padding:"4px 10px"}} onClick={()=>openEdit(v)}>Edit</button>
                <button style={{...dbtn,fontSize:11,padding:"4px 10px"}} onClick={()=>del(v.id)}>Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal show={show} onClose={()=>{setShow(false);setEdit(null);setF(eF);}} title={edit?"Edit Voucher":"Add Voucher"}>
        {lbl("Title *")}<input style={inp} placeholder="Amazon Gift Card" value={f.title} onChange={up("title")}/>
        {lbl("Owner")}<select style={inp} value={f.owner_id} onChange={up("owner_id")}><option value="">—</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select>
        {lbl("Code")}<input style={inp} placeholder="XXXX-XXXX-XXXX" value={f.code} onChange={up("code")}/>
        {lbl("Value (Rs)")}<input style={inp} type="number" placeholder="500" value={f.value} onChange={up("value")}/>
        {lbl("Expiry date")}<input style={inp} type="date" value={f.expiry} onChange={up("expiry")}/>
        {lbl("Notes")}<input style={inp} placeholder="Any notes" value={f.notes} onChange={up("notes")}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={save}>{edit?"Save Changes":"Add Voucher"}</button>
      </Modal>
    </div>
  );
}

// ── SetupOwners ───────────────────────────────────────────────────────────────
function SetupOwners({db,owners,reloadOwners}){
  const [showAdd,setShowAdd]=useState(false);
  const [newOwner,setNewOwner]=useState("");

  const addOwner=async()=>{
    if(!newOwner.trim()) return;
    await db.from("owners").insert({name:newOwner.trim()});
    setNewOwner("");setShowAdd(false);reloadOwners();
  };
  const delOwner=async owner=>{
    const [c,p,v]=await Promise.all([db.from("my_cards").filter("owner_id",owner.id),db.from("my_programs").filter("owner_id",owner.id),db.from("vouchers").filter("owner_id",owner.id)]);
    const n=(c.data||[]).length+(p.data||[]).length+(v.data||[]).length;
    if(n>0) return alert("Cannot delete \""+owner.name+"\" — they have "+n+" linked cards, programs or vouchers. Reassign or delete those first.");
    if(!confirm("Delete owner \""+owner.name+"\"?")) return;
    await db.from("owners").delete(owner.id);
    reloadOwners();
  };

  return(
    <div>
      <Hdr title="Owners" sub="People whose points you track"/>
      <div style={{maxWidth:520}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>Owners</div>
            <button style={{...gbtn,padding:"6px 14px",fontSize:12}} onClick={()=>setShowAdd(true)}>+ Add Owner</button>
          </div>
          {owners.length===0?<div style={{color:mut,fontSize:13}}>No owners yet</div>:owners.map(o=>(
            <div key={o.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${bdr}`}}>
              <div style={{fontSize:14,fontWeight:600,color:txt}}>{o.name}</div>
              <button style={{...dbtn,padding:"4px 10px",fontSize:12}} onClick={()=>delOwner(o)}>Delete</button>
            </div>
          ))}
        </Card>
      </div>
      <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="Add Owner">
        {lbl("Name")}<input style={inp} placeholder="Gavin" value={newOwner} onChange={e=>setNewOwner(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addOwner()}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={addOwner}>Add Owner</button>
      </Modal>
    </div>
  );
}

// ── SettingsGeneral ───────────────────────────────────────────────────────────
function SettingsGeneral({db,onDisconnect}){
  return(
    <div>
      <Hdr title="General" sub="Database connection"/>
      <div style={{maxWidth:520}}>
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Database Connection</div>
          <div style={{fontSize:12,color:mut,marginBottom:4}}>Connected to</div>
          <div style={{fontSize:12,color:txt,fontFamily:"monospace",background:surf2,padding:"8px 12px",borderRadius:8,marginBottom:16,wordBreak:"break-all",border:`1px solid ${bdr}`}}>{localStorage.getItem("pv_u")}</div>
          <button style={dbtn} onClick={()=>{localStorage.removeItem("pv_u");localStorage.removeItem("pv_k");onDisconnect();}}>Disconnect</button>
        </Card>
      </div>
    </div>
  );
}

// ── SettingsDanger ────────────────────────────────────────────────────────────
function SettingsDanger({db,owners,onReset}){
  const [busy,setBusy]=useState(null); // which action is running

  const confirm2=(msg)=>{
    const v=window.prompt(msg+"\n\nType DELETE to confirm:");
    if(v===null) return false; // cancelled
    if(v!=="DELETE"){ alert("Incorrect entry — action cancelled. Please type DELETE exactly (case-sensitive)."); return false; }
    return true;
  };

  const deleteAllMyCards=async()=>{
    if(!confirm2("This will permanently delete ALL My Cards and their transactions.")) return;
    setBusy("mycards");
    const {data:cards}=await db.from("my_cards").select();
    for(const c of (cards||[])){
      const {data:txns}=await db.from("point_transactions").filter("entity_id",c.id);
      for(const t of (txns||[])) await db.from("point_transactions").delete(t.id);
      const {data:tl1}=await db.from("transfer_log").filter("from_id",c.id);
      const {data:tl2}=await db.from("transfer_log").filter("to_id",c.id);
      for(const t of [...(tl1||[]),...(tl2||[])]) await db.from("transfer_log").delete(t.id);
      await db.from("my_cards").delete(c.id);
    }
    setBusy(null);
    alert("Deleted "+(cards||[]).length+" My Cards and all their transactions.");
  };

  const deleteAllMyLPs=async()=>{
    if(!confirm2("This will permanently delete ALL My Loyalty Programs and their transactions.")) return;
    setBusy("mylps");
    const {data:progs}=await db.from("my_programs").select();
    for(const p of (progs||[])){
      const {data:txns}=await db.from("point_transactions").filter("entity_id",p.id);
      for(const t of (txns||[])) await db.from("point_transactions").delete(t.id);
      const {data:tl1}=await db.from("transfer_log").filter("from_id",p.id);
      const {data:tl2}=await db.from("transfer_log").filter("to_id",p.id);
      for(const t of [...(tl1||[]),...(tl2||[])]) await db.from("transfer_log").delete(t.id);
      await db.from("my_programs").delete(p.id);
    }
    setBusy(null);
    alert("Deleted "+(progs||[]).length+" My Programs and all their transactions.");
  };

  const deleteAllBalancesAndTxns=async()=>{
    if(!confirm2("This will delete ALL transactions and reset ALL balances to 0. Your cards and programs will remain but history will be wiped.")) return;
    setBusy("balances");
    // Delete all transactions
    const {data:txns}=await db.from("point_transactions").select();
    for(const t of (txns||[])) await db.from("point_transactions").delete(t.id);
    // Delete all transfer logs
    const {data:tl}=await db.from("transfer_log").select();
    for(const t of (tl||[])) await db.from("transfer_log").delete(t.id);
    // Reset all balances to 0
    const {data:cards}=await db.from("my_cards").select();
    for(const c of (cards||[])) await db.from("my_cards").update(c.id,{points_balance:0});
    const {data:progs}=await db.from("my_programs").select();
    for(const p of (progs||[])) await db.from("my_programs").update(p.id,{points_balance:0});
    setBusy(null);
    alert("Deleted "+((txns||[]).length)+" transactions and reset all balances to 0.");
  };

  const deleteAllTransferPartners=async()=>{
    if(!confirm2("This will permanently delete ALL master transfer partner routes from the catalog.")) return;
    setBusy("partners");
    const {data:parts}=await db.from("master_partners").select();
    for(const p of (parts||[])) await db.from("master_partners").delete(p.id);
    setBusy(null);
    alert("Deleted "+(parts||[]).length+" transfer partner routes.");
  };

  const resetAll=async()=>{
    if(!confirm2("This will permanently delete ALL data and reset PointsVault to blank.")) return;
    setBusy("all");
    const u=localStorage.getItem("pv_u"),k=localStorage.getItem("pv_k");
    const h={apikey:k,Authorization:"Bearer "+k,"Content-Type":"application/json"};
    for(const t of ["point_transactions","transfer_log","vouchers","my_cards","my_programs","master_milestones","master_partners","master_cards","master_programs","owners"]){
      await fetch(u+"/rest/v1/"+t+"?created_at=gte.2000-01-01",{method:"DELETE",headers:h}).catch(()=>{});
    }
    setBusy(null);
    alert("All data deleted.");
    localStorage.removeItem("pv_u");localStorage.removeItem("pv_k");
    onReset();
  };

  const dangerItem=(title,desc,btnLabel,action,key)=>(
    <div style={{padding:"18px 20px",border:`1.5px solid #fecaca`,borderRadius:12,marginBottom:12,background:"#fef2f2"}}>
      <div style={{fontSize:13,fontWeight:600,color:red,marginBottom:4}}>{title}</div>
      <div style={{fontSize:12,color:mut,marginBottom:12,lineHeight:1.5}}>{desc}</div>
      <button style={{...dbtn,background:red,color:"#fff",border:"none",opacity:busy===key?0.6:1,fontSize:12}} onClick={busy?undefined:action}>
        {busy===key?"Working…":btnLabel}
      </button>
    </div>
  );

  return(
    <div>
      <Hdr title="Danger Zone" sub="Irreversible actions — type DELETE to confirm each one"/>
      <div style={{maxWidth:560}}>
        {dangerItem("Delete all My Cards","Deletes all your My Cards and every transaction linked to them. Master cards in the catalog are unaffected.","Delete all My Cards",deleteAllMyCards,"mycards")}
        {dangerItem("Delete all My Loyalty Programs","Deletes all your My Programs and every transaction linked to them. Master programs in the catalog are unaffected.","Delete all My LPs",deleteAllMyLPs,"mylps")}
        {dangerItem("Reset spend categories to defaults","Deletes all custom categories and restores the original default list.","Reset categories to defaults",async()=>{
          if(!confirm2("This will delete all custom categories and restore defaults.")) return;
          setBusy("categories");
          const {data:existing}=await db.from("spend_categories").select();
          for(const c of (existing||[])) await db.from("spend_categories").delete(c.id);
          for(const name of ["Dining","Travel","Fuel","Groceries","Shopping","Utilities","Entertainment","Healthcare","Education","Rent","Insurance","Vouchers / Wallet","Reimbursable","Other"]){
            await db.from("spend_categories").insert({name,is_default:true});
          }
          setBusy(null);alert("Categories reset to defaults.");
        },"categories")}
        {dangerItem("Reset all balances & transactions","Wipes all transaction history and resets every card and LP balance to 0. Your cards and programs remain — just the history is cleared.","Reset all balances & transactions",deleteAllBalancesAndTxns,"balances")}
        {dangerItem("Delete all transfer partner routes","Removes all transfer partner routes from the catalog. Master cards and programs are unaffected.","Delete all transfer routes",deleteAllTransferPartners,"partners")}
        {dangerItem("Reset everything","Permanently deletes ALL data including owners, catalog, cards, programs, transactions and transfers. Cannot be undone.","Reset everything — start fresh",resetAll,"all")}
      </div>
    </div>
  );
}



// ── SetupCategories ───────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES=[
  "Dining","Travel","Fuel","Groceries","Shopping","Utilities",
  "Entertainment","Healthcare","Education","Rent","Insurance",
  "Vouchers / Wallet","Reimbursable","Other"
];

async function seedCategories(db){
  for(const name of DEFAULT_CATEGORIES){
    await db.from("spend_categories").insert({name,is_default:true});
  }
}

function SetupCategories({db}){
  const [cats,setCats]=useState([]);
  const [rules,setRules]=useState([]);
  const [busy,setBusy]=useState(true);
  const [activeTab,setActiveTab]=useState("categories"); // "categories" | "rules"
  // Category state
  const [newName,setNewName]=useState("");
  const [editId,setEditId]=useState(null);
  const [editName,setEditName]=useState("");
  // Rule state
  const [newKeyword,setNewKeyword]=useState("");
  const [newRuleCat,setNewRuleCat]=useState("");

  const load=useCallback(async()=>{
    setBusy(true);
    const [c,r]=await Promise.all([
      db.from("spend_categories").select(),
      db.from("merchant_rules").select(),
    ]);
    let rows=c.data||[];
    if(rows.length===0){await seedCategories(db);const {data:d2}=await db.from("spend_categories").select();rows=d2||[];}
    setCats(rows.sort((a,b)=>a.name.localeCompare(b.name)));
    setRules((r.data||[]).sort((a,b)=>a.keyword.localeCompare(b.keyword)));
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  // Category CRUD
  const addCat=async()=>{
    if(!newName.trim()) return;
    await db.from("spend_categories").insert({name:newName.trim(),is_default:false});
    setNewName(""); load();
  };
  const delCat=async id=>{if(!confirm("Delete this category?")) return;await db.from("spend_categories").delete(id);load();};
  const startEdit=(c)=>{setEditId(c.id);setEditName(c.name);};
  const saveEdit=async()=>{if(!editName.trim()) return;await db.from("spend_categories").update(editId,{name:editName.trim()});setEditId(null);load();};

  // Rule CRUD
  const addRule=async()=>{
    if(!newKeyword.trim()||!newRuleCat) return alert("Enter both keyword and category");
    await db.from("merchant_rules").insert({keyword:newKeyword.trim().toLowerCase(),category:newRuleCat});
    setNewKeyword(""); setNewRuleCat(""); load();
  };
  const delRule=async id=>{if(!confirm("Delete this rule?")) return;await db.from("merchant_rules").delete(id);load();};

  const tabBtn=active=>({padding:"7px 18px",borderRadius:20,border:`1px solid ${active?txt:bdr}`,cursor:"pointer",fontSize:12,fontWeight:active?600:400,background:active?txt:"transparent",color:active?"#fff":mut,fontFamily:"'Manrope',sans-serif"});

  return(
    <div>
      <Hdr title="Categories & Rules" sub="Manage spend categories and auto-categorisation rules"/>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <button style={tabBtn(activeTab==="categories")} onClick={()=>setActiveTab("categories")}>Categories ({cats.length})</button>
        <button style={tabBtn(activeTab==="rules")} onClick={()=>setActiveTab("rules")}>Auto-rules ({rules.length})</button>
      </div>

      {activeTab==="categories"&&<div style={{maxWidth:520}}>
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Add Category</div>
          <div style={{display:"flex",gap:8}}>
            <input style={{...inp,marginBottom:0,flex:1}} placeholder="e.g. Investments" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCat()}/>
            <button style={pbtn} onClick={addCat}>Add</button>
          </div>
        </Card>
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Categories ({cats.length})</div>
          {busy?<div style={{color:mut,fontSize:12}}>Loading…</div>:cats.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${bdr}`,gap:8}}>
              {editId===c.id?(
                <div style={{display:"flex",gap:6,flex:1}}>
                  <input style={{...inp,marginBottom:0,flex:1,fontSize:12,padding:"4px 8px"}} value={editName} onChange={e=>setEditName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveEdit()} autoFocus/>
                  <button style={{...pbtn,padding:"4px 12px",fontSize:12}} onClick={saveEdit}>Save</button>
                  <button style={{...gbtn,padding:"4px 10px",fontSize:12}} onClick={()=>setEditId(null)}>×</button>
                </div>
              ):(
                <>
                  <div style={{flex:1}}>
                    <span style={{fontSize:13,fontWeight:500,color:txt}}>{c.name}</span>
                    {c.is_default&&<span style={{fontSize:9,color:mut,marginLeft:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>default</span>}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button style={{...gbtn,padding:"3px 10px",fontSize:11}} onClick={()=>startEdit(c)}>Edit</button>
                    <button style={{...dbtn,padding:"3px 10px",fontSize:11}} onClick={()=>delCat(c.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
          <div style={{fontSize:11,color:mut,marginTop:12}}>Reset to defaults in Settings → Danger Zone</div>
        </Card>
      </div>}

      {activeTab==="rules"&&<div style={{maxWidth:600}}>
        <Card style={{marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Add Rule</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"end"}}>
            <div>
              {lbl("Keyword (case insensitive)")}
              <input style={{...inp,marginBottom:0}} placeholder="e.g. swiggy, zomato" value={newKeyword} onChange={e=>setNewKeyword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addRule()}/>
            </div>
            <div>
              {lbl("Category")}
              <select style={{...inp,marginBottom:0}} value={newRuleCat} onChange={e=>setNewRuleCat(e.target.value)}>
                <option value="">Select category…</option>
                {cats.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <button style={{...pbtn,alignSelf:"flex-end"}} onClick={addRule}>Add</button>
          </div>
          <div style={{fontSize:11,color:mut,marginTop:8}}>
            If the keyword appears anywhere in a transaction description, that category is applied. First matching rule wins.
          </div>
        </Card>
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:14}}>Rules ({rules.length})</div>
          {rules.length===0?<div style={{color:mut,fontSize:12}}>No rules yet — add one above</div>:rules.map(r=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${bdr}`,gap:8}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:12}}>
                <code style={{fontSize:12,background:surf2,padding:"2px 8px",borderRadius:6,color:txt,fontFamily:"monospace"}}>{r.keyword}</code>
                <span style={{fontSize:11,color:mut}}>→</span>
                <span style={{fontSize:12,color:txt,fontWeight:500}}>{r.category}</span>
              </div>
              <button style={{...dbtn,padding:"3px 10px",fontSize:11}} onClick={()=>delRule(r.id)}>Delete</button>
            </div>
          ))}
        </Card>
      </div>}
    </div>
  );
}


// ── SetupPeople ───────────────────────────────────────────────────────────────
function SetupPeople({db}){
  const [people,setPeople]=useState([]);
  const [showAdd,setShowAdd]=useState(false);
  const [newName,setNewName]=useState("");

  const load=useCallback(async()=>{
    const {data}=await db.from("people").select();
    setPeople(data||[]);
  },[db]);
  useEffect(()=>{load();},[load]);

  const add=async()=>{
    if(!newName.trim()) return;
    await db.from("people").insert({name:newName.trim()});
    setNewName("");setShowAdd(false);load();
  };
  const del=async id=>{
    if(!confirm("Delete this person?")) return;
    await db.from("people").delete(id);
    load();
  };

  return(
    <div>
      <Hdr title="People" sub="Friends and family for reimbursement tracking"/>
      <div style={{maxWidth:520}}>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>People</div>
            <button style={{...gbtn,padding:"6px 14px",fontSize:12}} onClick={()=>setShowAdd(true)}>+ Add Person</button>
          </div>
          {people.length===0?<div style={{color:mut,fontSize:13}}>No people added yet</div>:people.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${bdr}`}}>
              <div style={{fontSize:14,fontWeight:600,color:txt}}>{p.name}</div>
              <button style={{...dbtn,padding:"4px 10px",fontSize:12}} onClick={()=>del(p.id)}>Delete</button>
            </div>
          ))}
        </Card>
      </div>
      <Modal show={showAdd} onClose={()=>setShowAdd(false)} title="Add Person">
        {lbl("Name")}<input style={inp} placeholder="Priya" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={add}>Add Person</button>
      </Modal>
    </div>
  );
}

// ── SpendUpload ───────────────────────────────────────────────────────────────
const CATEGORIES=["Dining","Travel","Fuel","Groceries","Shopping","Utilities","Entertainment","Healthcare","Education","Rent","Insurance","Vouchers / Wallet","Reimbursable","Other"];

const DEFAULT_RULES=[
  {keyword:"swiggy",category:"Dining"},{keyword:"zomato",category:"Dining"},{keyword:"eazydiner",category:"Dining"},
  {keyword:"irctc",category:"Travel"},{keyword:"makemytrip",category:"Travel"},{keyword:"goibibo",category:"Travel"},
  {keyword:"cleartrip",category:"Travel"},{keyword:"indigo",category:"Travel"},{keyword:"airindia",category:"Travel"},
  {keyword:"uber",category:"Travel"},{keyword:"ola ",category:"Travel"},{keyword:"rapido",category:"Travel"},
  {keyword:"bpcl",category:"Fuel"},{keyword:"hpcl",category:"Fuel"},{keyword:"iocl",category:"Fuel"},
  {keyword:"petrol",category:"Fuel"},{keyword:"fuel",category:"Fuel"},
  {keyword:"bigbasket",category:"Groceries"},{keyword:"grofer",category:"Groceries"},{keyword:"blinkit",category:"Groceries"},
  {keyword:"zepto",category:"Groceries"},{keyword:"dmart",category:"Groceries"},{keyword:"reliance fresh",category:"Groceries"},
  {keyword:"amazon",category:"Shopping"},{keyword:"flipkart",category:"Shopping"},{keyword:"myntra",category:"Shopping"},
  {keyword:"ajio",category:"Shopping"},{keyword:"nykaa",category:"Shopping"},{keyword:"meesho",category:"Shopping"},
  {keyword:"electricity",category:"Utilities"},{keyword:"bescom",category:"Utilities"},{keyword:"tata power",category:"Utilities"},
  {keyword:"jio",category:"Utilities"},{keyword:"airtel",category:"Utilities"},{keyword:"vi ",category:"Utilities"},
  {keyword:"bookmyshow",category:"Entertainment"},{keyword:"pvr",category:"Entertainment"},{keyword:"netflix",category:"Entertainment"},
  {keyword:"spotify",category:"Entertainment"},{keyword:"hotstar",category:"Entertainment"},
  {keyword:"apollo",category:"Healthcare"},{keyword:"medplus",category:"Healthcare"},{keyword:"practo",category:"Healthcare"},
  {keyword:"1mg",category:"Healthcare"},{keyword:"pharmeasy",category:"Healthcare"},
  {keyword:"lici",category:"Insurance"},{keyword:"hdfc life",category:"Insurance"},{keyword:"icici pru",category:"Insurance"},
  {keyword:"voucher",category:"Vouchers / Wallet"},{keyword:"giftcard",category:"Vouchers / Wallet"},
  {keyword:"paytm",category:"Vouchers / Wallet"},{keyword:"phonepe",category:"Vouchers / Wallet"},
];

function applyRules(desc, rules){
  const d=(desc||"").toLowerCase();
  const dNoSpace=d.replace(/\s+/g,""); // also try matching without spaces
  for(const r of rules){
    const k=r.keyword.toLowerCase();
    const kNoSpace=k.replace(/\s+/g,"");
    if(d.includes(k)||dNoSpace.includes(kNoSpace)) return r.category;
  }
  return "Other";
}

function parseCSV(text, forcedDelim){
  const allLines=text.replace(/\r/g,"").split("\n").filter(l=>l.trim());
  // Use forced delimiter if specified, otherwise auto-detect
  let delim=",";
  if(forcedDelim&&forcedDelim!=="auto"){
    delim=forcedDelim;
  } else {
    const sample=allLines.slice(0,5).join("\n");
    if(/~[Ii]~/.test(sample)) delim=sample.match(/~([Ii])~/)[0];
    else if(sample.includes("\t")) delim="\t";
    else if(sample.includes(";")) delim=";";
    else {
      const firstLine=allLines.find(l=>l.length>10)||"";
      if((firstLine.match(/,/g)||[]).length<2&&(firstLine.match(/\|/g)||[]).length>2) delim="|";
    }
  }
  return allLines.map(line=>{
    if(delim===","){
      const cols=[]; let cur=""; let inQ=false;
      for(let i=0;i<line.length;i++){
        const ch=line[i];
        if(ch==='"'){inQ=!inQ;}
        else if(ch===","&&!inQ){cols.push(cur.trim());cur="";}
        else cur+=ch;
      }
      cols.push(cur.trim());
      return cols;
    }
    return line.split(delim).map(c=>c.replace(/^"|"$/g,"").replace(/~/g,"").trim());
  });
}

function SpendUpload({db,owners}){
  const [step,setStep]=useState(1); // 1=upload 2=map 3=preview 4=done
  const [rawRows,setRawRows]=useState([]);
  const [fileName,setFileName]=useState("");
  const [mappings,setMappings]=useState([]);
  const [cards,setCards]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [people,setPeople]=useState([]);
  const [rules,setRules]=useState([]);
  const [parsed,setParsed]=useState([]); // [{date,desc,amount,category,reimbursable,person_id,skip}]
  const [importing,setImporting]=useState(false);
  const [importResult,setImportResult]=useState(null);
  const [categories,setCategories]=useState(DEFAULT_CATEGORIES);
  const [stmtMonthSel,setStmtMonthSel]=useState("");
  const [ruleSuggestions,setRuleSuggestions]=useState([]); // [{keyword,category,checked}]
  const [showRuleSuggestions,setShowRuleSuggestions]=useState(false);
  const [totalDue,setTotalDue]=useState("");
  const [openingBal,setOpeningBal]=useState("");
  const [totalDueRow,setTotalDueRow]=useState("6");
  const [totalDueCol,setTotalDueCol]=useState("2"); // 1-based: col 2 in HDFC
  const [openingBalRow,setOpeningBalRow]=useState("13");
  const [openingBalCol,setOpeningBalCol]=useState("1"); // 1-based: col 1 in HDFC
  const [rawText,setRawText]=useState("");
  const [colWidths,setColWidths]=useState([]);
  const [uploadError,setUploadError]=useState("");

  // Mapping form state
  const [mapName,setMapName]=useState("");
  const [selCard,setSelCard]=useState("");
  const [dateCol,setDateCol]=useState(0);
  const [descCol,setDescCol]=useState(1);
  const [amtType,setAmtType]=useState("single"); // single | split
  const [amtCol,setAmtCol]=useState(2);
  const [debitCol,setDebitCol]=useState(2);
  const [creditCol,setCreditCol]=useState(3);
  const [creditIndCol,setCreditIndCol]=useState(-1); // col that indicates credit when non-empty (-1 = none)
  const [dateFormat,setDateFormat]=useState("DD/MM/YYYY");
  const [skipRows,setSkipRows]=useState(1);
  const [manualDelim,setManualDelim]=useState("auto");
  const [selMapping,setSelMapping]=useState("");

  useEffect(()=>{
    (async()=>{
      const [c,mc,p,r,dbRules,dbCats]=await Promise.all([
        db.from("my_cards").select(),
        db.from("master_cards").select(),
        db.from("people").select(),
        db.from("csv_mappings").select(),
        db.from("merchant_rules").select(),
        db.from("spend_categories").select(),
      ]);
      setCards(c.data||[]);
      setMCards(mc.data||[]);
      setPeople(p.data||[]);
      setMappings(r.data||[]);
      setRules([...DEFAULT_RULES,...(dbRules.data||[])]);
      // Use DB categories if available, else defaults
      const dbCatList=(dbCats.data||[]).map(x=>x.name);
      if(dbCatList.length>0) setCategories(dbCatList);
    })();
  },[db]);

  const parseDate=(str,fmt)=>{
    str=(str||"").trim().replace(/^["']+|["']+$/g,"");
    // Strip time component if present (e.g. "02/05/2026 15:49:44")
    str=str.split(" ")[0].split("T")[0];
    if(fmt==="DD/MM/YYYY"||fmt==="auto"){
      const p=str.split(/[\/\-\.]/);
      if(p.length===3){
        if(p[0].length===4) return `${p[0]}-${p[1].padStart(2,"0")}-${p[2].padStart(2,"0")}`;
        return `${p[2]}-${p[1].padStart(2,"0")}-${p[0].padStart(2,"0")}`;
      }
    }
    if(fmt==="MM/DD/YYYY"){
      const p=str.split(/[\/\-\.]/);
      if(p.length===3) return `${p[2]}-${p[0].padStart(2,"0")}-${p[1].padStart(2,"0")}`;
    }
    if(fmt==="YYYY-MM-DD") return str.substring(0,10);
    return str;
  };



  const applyMapping=m=>{
    setMapName(m.name); setSelCard(m.card_id||"");
    setDateCol(Number(m.date_col)||0); setDescCol(Number(m.desc_col)||1);
    setAmtType(m.amount_type||"single"); setAmtCol(Number(m.amount_col)||2);
    setDebitCol(Number(m.debit_col)||2); setCreditCol(Number(m.credit_col)||3);
    setDateFormat(m.date_format||"DD/MM/YYYY"); setSkipRows(Number(m.skip_rows)||1);
    setCreditIndCol(m.credit_ind_col!==undefined&&m.credit_ind_col!==null?Number(m.credit_ind_col):-1);
    if(m.total_due_row!=null) setTotalDueRow(String(m.total_due_row));
    if(m.total_due_col!=null) setTotalDueCol(String(m.total_due_col));
    if(m.opening_bal_row!=null) setOpeningBalRow(String(m.opening_bal_row));
    if(m.opening_bal_col!=null) setOpeningBalCol(String(m.opening_bal_col));
    const delim=m.delimiter||"auto";
    setManualDelim(delim);
    setSelMapping(m.id);
    // Re-parse with restored delimiter if we have raw text
    if(rawText){
      const rows=parseCSV(rawText, delim==="auto"?undefined:delim);
      setRawRows(rows);
      setColWidths([]);
    }
  };

  const buildParsed=(opts={})=>{
    const sk=opts.skipRows!==undefined?opts.skipRows:skipRows;
    const dc=opts.dateCol!==undefined?opts.dateCol:dateCol;
    const dsc=opts.descCol!==undefined?opts.descCol:descCol;
    const ac=opts.amtCol!==undefined?opts.amtCol:amtCol;
    const at=opts.amtType||amtType;
    const dbc=opts.debitCol!==undefined?opts.debitCol:debitCol;
    const crc=opts.creditCol!==undefined?opts.creditCol:creditCol;
    const cic=opts.creditIndCol!==undefined?opts.creditIndCol:creditIndCol;
    const df=opts.dateFormat||dateFormat;
    const rows=opts.rawRows||rawRows;
    const dataRows=rows.slice(sk);
    return dataRows.filter(r=>r.length>1).map(row=>{
      const desc=(row[dsc]||"").replace(/"/g,"").trim();
      const dateStr=parseDate(row[dc]||"",df);
      let amount=0;
      if(at==="single"){
        const raw=(row[ac]||"").replace(/[,'"₹Rs\s]/g,"").trim();
        const absAmt=Math.abs(parseFloat(raw)||0);
        // If a credit indicator column is set and non-empty, it's a credit/refund
        const isCredit=cic>=0&&(row[cic]||"").trim().length>0;
        amount=isCredit?-absAmt:absAmt;
      } else {
        const dRaw=(row[dbc]||"").replace(/[,'"₹Rs]/g,"").trim();
        const cRaw=(row[crc]||"").replace(/[,'"₹Rs]/g,"").trim();
        const d=parseFloat(dRaw)||0;
        const c=parseFloat(cRaw)||0;
        amount=d>0?d:-c;
      }
      const category=applyRules(desc,rules);
      return{date:dateStr,desc,amount,category,skip:!dateStr};
    }).filter(r=>r.date);
  };

  const saveMapping=async()=>{
    if(!mapName.trim()) return alert("Please enter a mapping name");
    const p={name:mapName.trim(),card_id:selCard||null,date_col:dateCol,desc_col:descCol,amount_type:amtType,amount_col:amtCol,debit_col:debitCol,credit_col:creditCol,date_format:dateFormat,skip_rows:skipRows,credit_ind_col:creditIndCol,delimiter:manualDelim,total_due_row:parseInt(totalDueRow)||0,total_due_col:parseInt(totalDueCol),opening_bal_row:parseInt(openingBalRow)||0,opening_bal_col:parseInt(openingBalCol)};
    try{
      if(selMapping){
        const {error}=await db.from("csv_mappings").update(selMapping,p);
        if(error) throw error;
      } else {
        const {error}=await db.from("csv_mappings").insert(p);
        if(error) throw error;
      }
      const {data}=await db.from("csv_mappings").select();
      setMappings(data||[]);
      setSelMapping("");
      alert("Mapping \""+p.name+"\" saved!");
    }catch(e){
      alert("Save failed: "+JSON.stringify(e));
    }
  };

  const goToPreview=()=>{

    // Read billing fields synchronously before state update
    const tdr=parseInt(totalDueRow)||0;
    const tdc=parseInt(totalDueCol)||1;
    const obr=parseInt(openingBalRow)||0;
    const obc=parseInt(openingBalCol)||1;
    const cn=s=>(s||"").replace(/[,₹|~'"]/g,"").trim();
    const readCell=(rowIdx,colIdx1based)=>{
      const row=(rawRows[rowIdx]||[]);
      const ci=colIdx1based-1; // convert 1-based to 0-based
      return cn(row[ci]||"");
    };
    // Compute values synchronously
    let newTotalDue="";
    let newOpeningBal="";
    if(rawRows.length>tdr){
      const due=parseFloat(readCell(tdr,tdc));
      if(!isNaN(due)&&due>0) newTotalDue=String(due);
    }
    if(rawRows.length>obr){
      const ob=parseFloat(readCell(obr,obc));
      if(!isNaN(ob)&&ob!==0) newOpeningBal=String(ob);
    }
    // Set all state at once then move to step 3
    setTotalDue(newTotalDue);
    setOpeningBal(newOpeningBal);
    setParsed(buildParsed());
    setStep(3);
  };

  const [showMonthModal,setShowMonthModal]=useState(false);

  const doImport=async()=>{
    if(!selCard) return alert("Please select a card before importing. Every statement must be linked to a card.");
    if(!stmtMonthSel){setShowMonthModal(true);return;}
    runImport();
  };

  const runImport=async()=>{
    setShowMonthModal(false);
    setImporting(true);
    let added=0,skipped=0;
    const stmtMonth=stmtMonthSel;
    // Check for duplicate statement (same card + same month)
    if(selCard){
      const {data:existingStmts}=await db.from("statements").filter("card_id",selCard);
      const dup=(existingStmts||[]).find(s=>s.statement_month===stmtMonth);
      if(dup){
        setImporting(false);
        return alert("A statement for "+stmtMonth+" already exists for this card. Delete it first (Spend Tracker → My Cards → View Statements) or choose a different month.");
      }
    }
    let stmtId=null;
    try{
      // Check for duplicate file name on same card
      if(fileName){
        const {data:existingByName}=await db.from("statements").filter("card_id",selCard);
        const dupName=(existingByName||[]).find(s=>s.file_name===fileName&&s.statement_month!==stmtMonth);
        if(dupName){
          setImporting(false);
          const msg=`A statement with the file name "${fileName}" was already imported for ${fmtMonth(dupName.statement_month)}. Are you importing the same file for a different month?`;
          if(!confirm(msg+" Click OK to continue anyway, or Cancel to go back.")) return;
        }
      }
      const {data:stmtData}=await db.from("statements").insert({
        card_id:selCard||null,
        statement_month:stmtMonth,
        transaction_count:parsed.filter(r=>!r.skip).length,
        total_spend:parsed.filter(r=>!r.skip&&r.amount>0).reduce((a,r)=>a+r.amount,0),
        file_name:fileName,
        total_due:parseFloat(totalDue)||0,
        opening_balance:parseFloat(openingBal)||0,
      });
      stmtId=stmtData?.[0]?.id||null;
    }catch(e){console.warn("statements table:",e);}

    for(const row of parsed){
      if(row.skip) continue;
      const txnData={
        card_id:selCard||null,
        txn_date:row.date,
        description:row.desc,
        amount:row.amount,
        category:row.category,
        is_reimbursable:false,
        raw_description:row.desc,
        imported_from:fileName,
        statement_month:stmtMonth,
      };
      if(stmtId) txnData.statement_id=stmtId;
      const {error}=await db.from("spend_transactions").insert(txnData);
      if(!error) added++;
    }
    setImporting(false);

    // Compute rule suggestions: transactions where user changed category from default
    const existingRules=rules.map(r=>r.keyword.toLowerCase());
    const suggestions=[];
    const seen=new Set();
    for(const row of parsed){
      if(row.skip) continue;
      const autocat=applyRules(row.desc,rules);
      if(row.category!==autocat&&row.category!=="Other"){
        // User explicitly set a different category — suggest a rule
        const words=row.desc.trim().split(/\s+/);
        // Find first word that's long enough and not already a rule
        const keyword=words.find(w=>w.length>=4&&!existingRules.includes(w.toLowerCase()));
        if(keyword&&!seen.has(keyword.toLowerCase())){
          seen.add(keyword.toLowerCase());
          suggestions.push({keyword:keyword.toLowerCase(),category:row.category,checked:true,desc:row.desc});
        }
      }
    }
    if(suggestions.length>0){
      setRuleSuggestions(suggestions);
      setShowRuleSuggestions(true);
    }

    setImportResult({added,skipped});
    setStmtMonthSel("");
    setStep(4);
  };

  const upd=(i,field,val)=>setParsed(prev=>prev.map((r,ri)=>ri===i?{...r,[field]:val}:r));

  // Use max columns across all rows for column options
  const maxCols=Math.max(...rawRows.map(r=>r.length),1);
  // Show transaction header row labels (skipRows-1 is usually the header)
  const headerRow=rawRows[skipRows>0?skipRows-1:0]||[];
  const colLbl=i=>`Col ${i+1}${headerRow[i]?` (${headerRow[i].substring(0,14)})`:""}`;
  const colOpts=Array.from({length:maxCols},(_,i)=>colLbl(i));

  const ss={...{fontSize:12,border:`1px solid ${bdr}`,borderRadius:8,padding:"7px 10px",background:surf,color:txt,fontFamily:"'Manrope',sans-serif",outline:"none",width:"100%"}};
  const total=parsed.filter(r=>!r.skip).length;
  const totalAmt=parsed.filter(r=>!r.skip).reduce((a,r)=>a+r.amount,0);


  // ── Step 1: Upload ──────────────────────────────────────────────────────────
  const processFile=file=>{
    if(!file) return;
    setUploadError("");
    setFileName(file.name);
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const text=ev.target.result;
        if(!text||text.length===0){setUploadError("File appears to be empty");return;}
        const rows=parseCSV(text, manualDelim==="auto"?undefined:manualDelim);
        if(!rows||rows.length===0){setUploadError("Could not parse any rows from file");return;}
        setRawRows(rows);
        setRawText(text);
        setColWidths([]);
        setStep(2);
      }catch(err){
        setUploadError("Parse error: "+err.message);
      }
    };
    reader.onerror=()=>setUploadError("Could not read file: "+reader.error);
    reader.readAsText(file);
  };

  if(step===1) return(
    <div>
      <Hdr title="CC Statement Upload" sub="Import credit card transactions from CSV"/>
      <div style={{maxWidth:520}}>
        <Card>
          <div style={{fontSize:13,fontWeight:600,color:txt,marginBottom:16}}>Select your CSV file</div>
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            style={{display:"block",width:"100%",padding:"12px",border:`2px solid ${bdr}`,borderRadius:10,fontSize:13,background:surf2,cursor:"pointer",color:txt,fontFamily:"'Manrope',sans-serif"}}
            onChange={e=>{
              const file=e.target.files&&e.target.files[0];
              if(file) processFile(file);
            }}
          />
          {fileName&&!uploadError&&<div style={{fontSize:12,color:grn,marginTop:8,fontWeight:500}}>✓ {fileName} — processing…</div>}
          {uploadError&&<div style={{fontSize:12,color:red,marginTop:8,fontWeight:500}}>✗ {uploadError}</div>}
          <div style={{fontSize:11,color:mut,marginTop:10}}>Supported: CSV files from HDFC, Axis, Amex etc.</div>
          {mappings.length>0&&<div style={{marginTop:20}}>
            <div style={{fontSize:11,color:mut,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500}}>Saved mappings</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {mappings.map(m=>{
                const card=cards.find(c=>c.id===m.card_id);
                const mc=card&&mCards.find(x=>x.id===card.master_id);
                return<div key={m.id} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${bdr}`,fontSize:12,color:mut,background:surf2,display:"flex",alignItems:"center",gap:8}}>
                  <span>{m.name}{mc&&" · "+mc.name}</span>
                  <button onClick={async()=>{if(!confirm("Delete mapping "+m.name+"?")) return;await db.from("csv_mappings").delete(m.id);const {data}=await db.from("csv_mappings").select();setMappings(data||[]);}} style={{background:"none",border:"none",cursor:"pointer",color:red,fontSize:13,padding:0,lineHeight:1}}>×</button>
                </div>;
              })}
            </div>
          </div>}
        </Card>
      </div>
    </div>
  );

  // ── Step 2: Map columns ─────────────────────────────────────────────────────
  if(step===2) return(
    <div>
      <Hdr title="Map Columns" sub={fileName}/>
      <div style={{width:"100%"}}>
        {mappings.length>0&&<Card style={{marginBottom:16}}>
          <div style={{fontSize:11,color:mut,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500}}>Load a saved mapping</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {mappings.map(m=><button key={m.id} onClick={()=>applyMapping(m)} style={{...gbtn,fontSize:12,background:selMapping===m.id?surf3:surf}}>{m.name}</button>)}
          </div>
        </Card>}

        {/* Preview of raw CSV */}
        <Card style={{marginBottom:16,maxWidth:"100%"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,color:mut,textTransform:"uppercase",letterSpacing:"0.07em",fontWeight:500}}>CSV Preview — drag ↔ to resize columns</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:10,color:mut}}>Detected delimiter: <strong style={{color:txt}}>{(()=>{const s=rawRows.slice(0,5).map(r=>r.join("~I~")).join("\n");return s.includes("~I~")||s.includes("~i~")?"~I~":rawRows[0]?.length>1?"auto-detected":"comma";})()} </strong></span>
              <button style={{...gbtn,fontSize:11,padding:"4px 12px"}} onClick={()=>{
                const text=rawRows.slice(0,30).map((row,ri)=>ri+"\t"+row.join("\t")).join("\n");
                navigator.clipboard.writeText(text).then(()=>alert("Copied!"));
              }}>Copy preview</button>
            </div>
          </div>
          {(()=>{
            const numCols=Math.max(...rawRows.slice(0,30).map(r=>r.length),1);
            const widths=colWidths.length===numCols?colWidths:Array(numCols).fill(160);

            const onResizeStart=(e,ci)=>{
              e.preventDefault();
              const startX=e.clientX;
              const startW=widths[ci];
              const move=ev=>{
                const nw=Math.max(50,startW+(ev.clientX-startX));
                setColWidths(prev=>{
                  const arr=[...(prev.length===numCols?prev:Array(numCols).fill(160))];
                  arr[ci]=nw;
                  return arr;
                });
              };
              const up=()=>{
                document.removeEventListener("mousemove",move);
                document.removeEventListener("mouseup",up);
              };
              document.addEventListener("mousemove",move);
              document.addEventListener("mouseup",up);
            };

            return(
              <div style={{overflowX:"auto",maxHeight:360,overflowY:"auto",border:`1px solid ${bdr}`,borderRadius:8}}>
                <table style={{borderCollapse:"collapse",fontSize:11,tableLayout:"fixed",width:"max-content",minWidth:"100%"}}>
                  <colgroup>
                    <col style={{width:36}}/>
                    {widths.map((w,i)=><col key={i} style={{width:w}}/>)}
                  </colgroup>
                  <thead style={{position:"sticky",top:0,zIndex:2}}>
                    <tr style={{background:surf3,borderBottom:`2px solid ${bdr}`}}>
                      <th style={{padding:"6px 8px",color:mut,fontSize:10,fontWeight:600,textAlign:"left",background:surf3}}>#</th>
                      {widths.map((w,ci)=>(
                        <th key={ci} style={{padding:"6px 8px",color:mut,fontSize:10,fontWeight:600,textAlign:"left",position:"relative",background:surf3,userSelect:"none"}}>
                          <span>Col {ci+1}</span>
                          <span
                            onMouseDown={e=>onResizeStart(e,ci)}
                            style={{position:"absolute",right:0,top:0,bottom:0,width:12,cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:acc,fontWeight:700,background:surf2}}
                            title="Drag to resize"
                          >↔</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawRows.slice(0,30).map((row,ri)=>(
                      <tr key={ri} style={{background:ri===skipRows?acc+"15":ri%2===0?surf:surf2,borderBottom:`1px solid ${bdr}`}}>
                        <td style={{padding:"5px 8px",color:ri===skipRows?acc:mut,fontWeight:ri===skipRows?700:400,whiteSpace:"nowrap",verticalAlign:"top"}}>{ri}</td>
                        {widths.map((_,ci)=>(
                          <td key={ci} style={{padding:"5px 8px",color:ri===skipRows?acc:txt,wordBreak:"break-word",whiteSpace:"normal",verticalAlign:"top",maxWidth:widths[ci]}}>
                            {row[ci]||""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
          <div style={{fontSize:11,color:acc,marginTop:6,display:"flex",alignItems:"center",gap:10}}>
            <span>↑ Highlighted row {skipRows} = first data row based on your "Skip header rows" setting</span>
            <button style={{...gbtn,fontSize:11,padding:"3px 10px"}} onClick={()=>{
              // Find first row that looks like a transaction (has a date-like value)
              const dateRe=/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
              for(let i=1;i<rawRows.length;i++){
                if(rawRows[i].some(cell=>dateRe.test(cell))){
                  setSkipRows(i);
                  break;
                }
              }
            }}>Auto-detect start row</button>
          </div>
        </Card>

        <Card>
          {/* ── Section 1: Identity ─────────────────────────────────── */}
          <div style={{fontSize:10,fontWeight:600,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>Mapping Identity</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div>
              {lbl("Mapping Name")}
              <input style={ss} value={mapName} onChange={e=>setMapName(e.target.value)} placeholder="e.g. HDFC Infinia"/>
            </div>
            <div>
              {lbl("Card *")}
              {!selCard&&<div style={{fontSize:11,color:red,marginBottom:4}}>Required</div>}
              <select style={ss} value={selCard} onChange={e=>setSelCard(e.target.value)}>
                <option value="">No card selected</option>
                {(()=>{
                  const grouped={};
                  cards.forEach(c=>{
                    const owner=owners.find(o=>o.id===c.owner_id);
                    const ownerName=owner?.name||"Unknown";
                    if(!grouped[ownerName]) grouped[ownerName]=[];
                    grouped[ownerName].push(c);
                  });
                  return Object.entries(grouped).map(([ownerName,ownerCards])=>(
                    <optgroup key={ownerName} label={"── "+ownerName+" ──"}>
                      {ownerCards.map(c=>{const m=mCards.find(x=>x.id===c.master_id);return<option key={c.id} value={c.id}>{c.nickname||m?.name||c.id}</option>;})}
                    </optgroup>
                  ));
                })()}
              </select>
            </div>
          </div>

          {/* ── Section 2: Parsing ─────────────────────────────────── */}
          <div style={{fontSize:10,fontWeight:600,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10,paddingTop:14,borderTop:`1px solid ${bdr}`}}>Parsing Settings</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              {lbl("Delimiter")}
              <div style={{display:"flex",gap:6}}>
                <select style={{...ss,flex:1}} value={manualDelim} onChange={e=>setManualDelim(e.target.value)}>
                  <option value="auto">Auto-detect</option>
                  <option value="|">Pipe | (HDFC)</option>
                  <option value=",">Comma ,</option>
                  <option value="	">Tab</option>
                  <option value=";">Semicolon ;</option>
                  <option value="~I~">~I~ (legacy HDFC)</option>
                </select>
                <button style={{...gbtn,fontSize:11,whiteSpace:"nowrap"}} onClick={()=>{
                  if(rawText){const rows=parseCSV(rawText,manualDelim==="auto"?undefined:manualDelim);setRawRows(rows);setColWidths([]);}
                }}>↺</button>
              </div>
            </div>
            <div>
              {lbl("Skip header rows")}
              <select style={ss} value={skipRows} onChange={e=>setSkipRows(Number(e.target.value))}>
                {Array.from({length:31},(_,n)=><option key={n} value={n}>{n} row{n!==1?"s":""}</option>)}
              </select>
            </div>
            <div>
              {lbl("Date format")}
              <select style={ss} value={dateFormat} onChange={e=>setDateFormat(e.target.value)}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="auto">Auto-detect</option>
              </select>
            </div>
          </div>

          {/* ── Section 3: Column Mapping ─────────────────────────── */}
          <div style={{fontSize:10,fontWeight:600,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10,paddingTop:14,borderTop:`1px solid ${bdr}`}}>Column Mapping</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              {lbl("Date column")}
              <select style={ss} value={dateCol} onChange={e=>setDateCol(Number(e.target.value))}>
                {colOpts.map((l,i)=><option key={i} value={i}>{l}</option>)}
              </select>
            </div>
            <div>
              {lbl("Description column")}
              <select style={ss} value={descCol} onChange={e=>setDescCol(Number(e.target.value))}>
                {colOpts.map((l,i)=><option key={i} value={i}>{l}</option>)}
              </select>
            </div>
            <div>
              {lbl("Amount type")}
              <select style={ss} value={amtType} onChange={e=>setAmtType(e.target.value)}>
                <option value="single">Single column</option>
                <option value="split">Separate Debit / Credit</option>
              </select>
            </div>
            {amtType==="single"?(
              <>
                <div>
                  {lbl("Amount column")}
                  <select style={ss} value={amtCol} onChange={e=>setAmtCol(Number(e.target.value))}>
                    {colOpts.map((l,i)=><option key={i} value={i}>{l}</option>)}
                  </select>
                </div>
                <div>
                  {lbl("Credit indicator col (if non-empty = credit)")}
                  <select style={ss} value={creditIndCol} onChange={e=>setCreditIndCol(Number(e.target.value))}>
                    <option value={-1}>None</option>
                    {colOpts.map((l,i)=><option key={i} value={i}>{l}</option>)}
                  </select>
                </div>
              </>
            ):(
              <>
                <div>
                  {lbl("Debit column")}
                  <select style={ss} value={debitCol} onChange={e=>setDebitCol(Number(e.target.value))}>
                    {colOpts.map((l,i)=><option key={i} value={i}>{l}</option>)}
                  </select>
                </div>
                <div>
                  {lbl("Credit column")}
                  <select style={ss} value={creditCol} onChange={e=>setCreditCol(Number(e.target.value))}>
                    {colOpts.map((l,i)=><option key={i} value={i}>{l}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* ── Section 4: Billing Summary ─────────────────────────── */}
          <div style={{fontSize:10,fontWeight:600,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6,paddingTop:14,borderTop:`1px solid ${bdr}`}}>Billing Summary Location</div>
          <div style={{fontSize:11,color:mut,marginBottom:10}}>Enter the row and column numbers as you see them in the CSV preview above (Col 1 = first column).</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:4}}>
            <div>
              <div style={{fontSize:12,fontWeight:500,color:txt,marginBottom:6}}>Total Amount Due</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>{lbl("Row #")}<input type="text" inputMode="numeric" style={ss} value={totalDueRow} onChange={e=>setTotalDueRow(e.target.value)} placeholder="6"/></div>
                <div style={{flex:1}}>{lbl("Col #")}<input type="text" inputMode="numeric" style={ss} value={totalDueCol} onChange={e=>setTotalDueCol(e.target.value)} placeholder="2"/></div>
              </div>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:500,color:txt,marginBottom:6}}>Opening Balance (Prev Stmt Due)</div>
              <div style={{display:"flex",gap:8}}>
                <div style={{flex:1}}>{lbl("Row #")}<input type="text" inputMode="numeric" style={ss} value={openingBalRow} onChange={e=>setOpeningBalRow(e.target.value)} placeholder="13"/></div>
                <div style={{flex:1}}>{lbl("Col #")}<input type="text" inputMode="numeric" style={ss} value={openingBalCol} onChange={e=>setOpeningBalCol(e.target.value)} placeholder="1"/></div>
              </div>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",marginTop:14,paddingTop:14,borderTop:`1px solid ${bdr}`}}>
            <div style={{display:"flex",gap:8}}>
              <button style={gbtn} onClick={()=>setStep(1)}>← Back</button>
              <button style={{...gbtn,fontSize:12}} onClick={saveMapping}>Save mapping</button>
            </div>
            <button style={pbtn} onClick={goToPreview}>Preview →</button>
          </div>
        </Card>
      </div>
    </div>
  );

  // ── Step 3: Preview & categorise ───────────────────────────────────────────
  if(step===3) return(
    <div>
      {/* Billing summary verification */}
      {(()=>{
        // Show raw CSV cell values for debugging
        const tdr=parseInt(totalDueRow)||0;
        const tdc=parseInt(totalDueCol);
        const obr=parseInt(openingBalRow)||0;
        const obc=parseInt(openingBalCol);
        const getRow=ri=>(rawRows[ri]||[]);
        const getCell=(ri,ci1based)=>{
          const row=getRow(ri);
          return row[ci1based-1]||"";
        };
        const rawDue=getCell(tdr,tdc);
        const rawOb=getCell(obr,obc);
        const rowDueCells=getRow(tdr).map((v,i)=>`Col${i+1}: ${v||"—"}`).join(" | ");
        const rowObCells=getRow(obr).map((v,i)=>`Col${i+1}: ${v||"—"}`).join(" | ");
        return(
          <details style={{marginBottom:12}}>
            <summary style={{fontSize:11,color:mut,cursor:"pointer",padding:"6px 10px",background:surf2,borderRadius:8}}>🔍 Debug: raw CSV values (click to expand)</summary>
            <div style={{fontSize:11,fontFamily:"monospace",padding:"10px 12px",background:surf2,borderRadius:"0 0 8px 8px",borderTop:`1px solid ${bdr}`}}>
              <div style={{marginBottom:6}}><strong>Row {tdr} (Total Due):</strong> {rowDueCells||"(row empty)"}</div>
              <div style={{marginBottom:6}}><strong>Reading Col {tdc}:</strong> "{rawDue}"</div>
              <div style={{marginBottom:6}}><strong>Row {obr} (Opening Bal):</strong> {rowObCells||"(row empty)"}</div>
              <div><strong>Reading Col {obc}:</strong> "{rawOb}"</div>
            </div>
          </details>
        );
      })()}
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        {[
          {label:"Total Amount Due",value:totalDue,row:totalDueRow,col:totalDueCol},
          {label:"Opening Balance (Prev Stmt Due)",value:openingBal,row:openingBalRow,col:openingBalCol},
        ].map((f,i)=>(
          <Card key={i} style={{flex:1,minWidth:180,padding:"12px 16px",border:`2px solid ${f.value?grn+"55":amber+"55"}`}}>
            <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>{f.label}</div>
            {f.value?(
              <div style={{fontSize:20,fontWeight:700,color:grn,fontFamily:"'Manrope',sans-serif"}}>₹{parseFloat(f.value).toLocaleString("en-IN")}</div>
            ):(
              <div style={{fontSize:12,color:amber,fontWeight:500}}>⚠ Not read — check Row/Col settings in Step 2</div>
            )}
            <div style={{fontSize:10,color:mut,marginTop:3}}>Row {f.row} · Col {f.col===-1?"last":f.col}</div>
          </Card>
        ))}

        <Card style={{flex:1,minWidth:180,padding:"12px 16px"}}>
          <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>Debits this import</div>
          <div style={{fontSize:20,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>₹{parsed.filter(r=>!r.skip&&r.amount>0).reduce((a,r)=>a+r.amount,0).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
          <div style={{fontSize:10,color:mut,marginTop:3}}>{parsed.filter(r=>!r.skip&&r.amount>0).length} transactions</div>
        </Card>
        <Card style={{flex:1,minWidth:180,padding:"12px 16px"}}>
          <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4}}>Credits this import</div>
          <div style={{fontSize:20,fontWeight:700,color:grn,fontFamily:"'Manrope',sans-serif"}}>₹{Math.abs(parsed.filter(r=>!r.skip&&r.amount<0).reduce((a,r)=>a+r.amount,0)).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
          <div style={{fontSize:10,color:mut,marginTop:3}}>{parsed.filter(r=>!r.skip&&r.amount<0).length} transactions</div>
        </Card>
      </div>
      <Hdr title="Review Transactions" sub={`${total} transactions · ₹${totalAmt.toLocaleString("en-IN")}`}/>
      <div style={{marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:12,color:mut}}>
          {total===0&&<div style={{color:red,fontWeight:500,marginBottom:6}}>No transactions found. Check settings — Skip rows: {skipRows}, Date col: Col {dateCol+1}, Desc col: Col {descCol+1}, Amount col: Col {amtCol+1}. Make sure these match your CSV preview.</div>}
          Review and adjust categories before importing.
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={gbtn} onClick={()=>setStep(2)}>← Back</button>
          <button style={{...pbtn,opacity:importing?0.6:1}} onClick={doImport}>{importing?"Importing…":"Import "+total+" transactions →"}</button>
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`2px solid ${bdr}`,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:mut}}>
              <th style={{padding:"8px 10px",textAlign:"left",width:90}}>Date</th>
              <th style={{padding:"8px 10px",textAlign:"left"}}>Description</th>
              <th style={{padding:"8px 10px",textAlign:"right",width:100}}>Amount</th>
              <th style={{padding:"8px 10px",textAlign:"left",width:150}}>Category</th>
              <th style={{padding:"8px 10px",textAlign:"center",width:60}}>Skip</th>
            </tr>
          </thead>
          <tbody>
            {parsed.map((row,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${bdr}`,opacity:row.skip?0.35:1,background:row.amount<0?grn+"08":row.reimbursable?acc+"06":surf}}>
                <td style={{padding:"7px 10px",color:mut,whiteSpace:"nowrap"}}>{row.date}</td>
                <td style={{padding:"7px 10px",color:txt,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.desc}</td>
                <td style={{padding:"7px 10px",textAlign:"right",fontWeight:600,color:row.amount<0?grn:txt}}>
                  {row.amount<0?<span style={{fontSize:10,color:grn,marginRight:4}}>CREDIT</span>:null}
                  ₹{Math.abs(row.amount).toLocaleString("en-IN")}
                </td>
                <td style={{padding:"7px 10px"}}>
                  <select value={row.category} onChange={e=>upd(i,"category",e.target.value)}
                    style={{fontSize:11,border:`1px solid ${bdr}`,borderRadius:6,padding:"3px 6px",background:surf,color:txt,outline:"none",width:"100%"}}>
                    {categories.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </td>

                <td style={{padding:"7px 10px",textAlign:"center"}}>
                  <input type="checkbox" checked={row.skip} onChange={e=>upd(i,"skip",e.target.checked)} style={{width:15,height:15}}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
        <button style={{...pbtn,opacity:importing?0.6:1}} onClick={doImport}>{importing?"Importing…":"Import "+total+" transactions →"}</button>
      </div>
      <Modal show={showMonthModal} onClose={()=>setShowMonthModal(false)} title="Select Statement Month">
        <div style={{fontSize:13,color:mut,marginBottom:16}}>Which month is this statement for?</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div>
            {lbl("Month")}
            <select style={inp} value={stmtMonthSel?stmtMonthSel.split("-")[1]||"":""} onChange={e=>{const y=stmtMonthSel?stmtMonthSel.split("-")[0]||new Date().getFullYear().toString():new Date().getFullYear().toString();setStmtMonthSel(e.target.value?y+"-"+e.target.value:"");}}>
              <option value="">Select month…</option>
              {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m,i)=><option key={m} value={m}>{["January","February","March","April","May","June","July","August","September","October","November","December"][i]}</option>)}
            </select>
          </div>
          <div>
            {lbl("Year")}
            <select style={inp} value={stmtMonthSel?stmtMonthSel.split("-")[0]||"":""} onChange={e=>{const m=stmtMonthSel?stmtMonthSel.split("-")[1]||"01":"01";setStmtMonthSel(e.target.value?e.target.value+"-"+m:"");}}>
              <option value="">Select year…</option>
              {Array.from({length:11},(_,i)=>(new Date().getFullYear()-5+i).toString()).map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button style={{...pbtn,width:"100%",justifyContent:"center"}} onClick={()=>{
          if(!stmtMonthSel||!stmtMonthSel.includes("-")||stmtMonthSel.endsWith("-")||stmtMonthSel.startsWith("-")) return alert("Please select both month and year.");
          runImport();
        }}>Import</button>
      </Modal>
    </div>
  );

  // ── Step 4: Done ─────────────────────────────────────────────────────────────
  if(step===4) return(
    <div>
      <Hdr title="Import Complete" sub="Transactions added to your spend tracker"/>
      <Card style={{maxWidth:520,marginBottom:showRuleSuggestions?16:0}}>
        <div style={{textAlign:"center",padding:"24px 0"}}>
          <div style={{fontSize:40,marginBottom:12}}>✓</div>
          <div style={{fontSize:18,fontWeight:700,color:grn,marginBottom:8}}>{importResult?.added} transactions imported</div>
          {importResult?.skipped>0&&<div style={{fontSize:13,color:mut,marginBottom:8}}>{importResult.skipped} skipped</div>}
          <button style={{...pbtn,marginTop:8}} onClick={()=>{setStep(1);setRawRows([]);setFileName("");setParsed([]);setImportResult(null);setRuleSuggestions([]);setShowRuleSuggestions(false);}}>Upload another statement</button>
        </div>
      </Card>
      {showRuleSuggestions&&<Card style={{maxWidth:520}}>
        <div style={{fontSize:14,fontWeight:700,color:txt,marginBottom:4}}>Save auto-rules?</div>
        <div style={{fontSize:12,color:mut,marginBottom:16}}>
          You changed {ruleSuggestions.length} categor{ruleSuggestions.length!==1?"ies":"y"} from the default. Save these as rules for future imports?
        </div>
        {ruleSuggestions.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${bdr}`}}>
            <input type="checkbox" checked={s.checked} onChange={()=>setRuleSuggestions(prev=>prev.map((r,ri)=>ri===i?{...r,checked:!r.checked}:r))} style={{accentColor:acc,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,color:mut,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.desc}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                <input style={{...inp,marginBottom:0,fontSize:11,padding:"2px 6px",width:140}} value={s.keyword} onChange={e=>setRuleSuggestions(prev=>prev.map((r,ri)=>ri===i?{...r,keyword:e.target.value}:r))}/>
                <span style={{color:mut}}>→</span>
                <select style={{...inp,marginBottom:0,fontSize:11,padding:"2px 6px"}} value={s.category} onChange={e=>setRuleSuggestions(prev=>prev.map((r,ri)=>ri===i?{...r,category:e.target.value}:r))}>
                  {categories.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button style={{...gbtn,flex:1,justifyContent:"center"}} onClick={()=>setShowRuleSuggestions(false)}>Skip</button>
          <button style={{...pbtn,flex:1,justifyContent:"center"}} onClick={async()=>{
            const toSave=ruleSuggestions.filter(s=>s.checked&&s.keyword.trim());
            for(const s of toSave){
              await db.from("merchant_rules").insert({keyword:s.keyword.trim().toLowerCase(),category:s.category});
            }
            setShowRuleSuggestions(false);
            if(toSave.length>0) alert(`Saved ${toSave.length} rule${toSave.length!==1?"s":""}.`);
          }}>Save {ruleSuggestions.filter(s=>s.checked).length} rule{ruleSuggestions.filter(s=>s.checked).length!==1?"s":""}</button>
        </div>
      </Card>}
    </div>
  );

  return null;
}

const NAV=[
  {section:"Spend Tracker", items:[
    {id:"spend-overview",   label:"Overview"},
    {id:"spend-cards",      label:"My Cards"},
    {id:"spend-ledger",     label:"Ledger"},
    {id:"spend-upload",     label:"CC Statement Upload", beta:true},
  ], sub:[
    {label:"Setup", items:[
      {id:"spend-setup-people",      label:"People"},
      {id:"spend-setup-categories",  label:"Categories"},
    ]},
  ]},
  {section:"Points & Miles", items:[
    {id:"overview",         label:"Overview"},
    {id:"my-cards",         label:"My Cards"},
    {id:"my-programs",      label:"My Programs"},
    {id:"transfer",         label:"Transfer Points"},
    {id:"transfer-history", label:"Transfer History"},
    {id:"vouchers",         label:"Vouchers"},
  ], sub:[
    {label:"Setup", items:[
      {id:"pm-setup-catalog", label:"Master"},
      {id:"pm-setup-owners",  label:"Owners"},
    ]},
  ]},
  {section:"Transfer Routes", comingSoon:true, items:[]},
  {section:"Double Dip",      comingSoon:true, items:[]},
  {section:"Settings", items:[
    {id:"settings-general", label:"General"},
    {id:"settings-danger",  label:"Danger Zone"},
  ]},
];

export default function App(){
  const [db,setDb]=useState(null);
  const [tab,setTab]=useState("overview");
  const [menuOpen,setMenuOpen]=useState(false);
  const [owners,setOwners]=useState([]);
  const [collapsed,setCollapsed]=useState(()=>{const s=new Set();[0,1,2,3,4].forEach(i=>s.add('s'+i));return s;});

  useEffect(()=>{
    const u=localStorage.getItem("pv_u"),k=localStorage.getItem("pv_k");
    if(u&&k){const c=createClient(u,k);setDb(c);loadOwners(c);}
  },[]);

  const loadOwners=async client=>{
    const {data}=await (client||db).from("owners").select();
    setOwners(data||[]);
  };

  if(!db) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:bg,fontFamily:"'Manrope',sans-serif"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{fontSize:28,fontWeight:700,color:txt,letterSpacing:"-0.04em",marginBottom:6}}>PointsVault</div>
        <div style={{fontSize:13,color:mut,marginBottom:32,fontWeight:400,textTransform:"uppercase",letterSpacing:"0.08em"}}>Wealth Tracker</div>
        <Secret onConnect={(u,k)=>{const c=createClient(u,k);setDb(c);loadOwners(c);}}/>
      </div>
    </div>
  );

  const renderItem=(t,pl)=>(
    t.comingSoon?(
      <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",paddingLeft:pl,borderRadius:8,marginBottom:1,opacity:0.4,cursor:"not-allowed"}}>
        <span style={{fontSize:12,fontWeight:400,color:mut}}>{t.label}</span>
        <span style={{fontSize:9,color:mut,fontWeight:500,letterSpacing:"0.07em",textTransform:"uppercase",background:surf2,padding:"2px 6px",borderRadius:10,border:`1px solid ${bdr}`}}>soon</span>
      </div>
    ):(
      <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",paddingLeft:pl,cursor:"pointer",background:tab===t.id?surf3:"transparent",borderRadius:8,marginBottom:1,transition:"all 0.12s"}}>
        <span style={{fontSize:12,fontWeight:tab===t.id?600:400,color:tab===t.id?txt:mut}}>{t.label}</span>
        {t.beta&&<span style={{fontSize:8,color:acc,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",background:acc+"15",padding:"2px 5px",borderRadius:8,border:"1px solid "+acc+"33"}}>beta</span>}
      </div>
    )
  );

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden",fontFamily:"'Manrope',sans-serif",background:bg}}>

      {/* ── Desktop Sidebar ── */}
      <aside style={{width:220,background:surf,borderRight:`1px solid ${bdr}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
        <div style={{padding:"22px 20px 12px"}}>
          <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.04em"}}>PointsVault</div>
          <div style={{fontSize:9,color:mut,marginTop:2,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:500}}>Wealth Tracker</div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"0 12px 12px"}}>
          {NAV.map((section,si)=>{
            const isCollapsed=collapsed.has("s"+si);
            const hasItems=(section.items||[]).length>0||(section.sub||[]).length>0;
            if(section.comingSoon&&!hasItems) return(
              <div key={si} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,marginBottom:1,opacity:0.45,cursor:"not-allowed",marginTop:si>0?20:0}}>
                <span style={{fontSize:12,fontWeight:500,color:mut,letterSpacing:"-0.01em"}}>{section.section}</span>
                <span style={{fontSize:9,color:mut,fontWeight:500,letterSpacing:"0.07em",textTransform:"uppercase",background:surf2,padding:"2px 6px",borderRadius:10,border:`1px solid ${bdr}`}}>soon</span>
              </div>
            );
            return(
              <div key={si} style={{marginBottom:2,marginTop:si>0?20:0}}>
                <div onClick={()=>setCollapsed(prev=>{const n=new Set(prev);n.has("s"+si)?n.delete("s"+si):n.add("s"+si);return n;})}
                  style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 12px 5px",cursor:"pointer",marginTop:si>0?4:0,borderRadius:6,transition:"background 0.1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=surf2}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:11,fontWeight:700,color:txt,letterSpacing:"0.04em",textTransform:"uppercase"}}>{section.section}</span>
                  <span style={{fontSize:14,color:mut,transform:isCollapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block",lineHeight:1}}>▾</span>
                </div>
                {!isCollapsed&&<>
                  {(section.items||[]).map(t=>renderItem(t,12))}
                  {(section.sub||[]).map((sub,subi)=>{
                    const subKey="sub"+si+"-"+subi;
                    const subCollapsed=collapsed.has(subKey);
                    return(
                      <div key={subi} style={{marginTop:2}}>
                        <div onClick={()=>setCollapsed(prev=>{const n=new Set(prev);n.has(subKey)?n.delete(subKey):n.add(subKey);return n;})}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 12px",cursor:"pointer",borderRadius:6,transition:"background 0.1s"}}
                          onMouseEnter={e=>e.currentTarget.style.background=surf2}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{fontSize:12,fontWeight:400,color:mut}}>{sub.label}</span>
                          <span style={{fontSize:12,color:mut,transform:subCollapsed?"rotate(-90deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block",lineHeight:1}}>▾</span>
                        </div>
                        {!subCollapsed&&(sub.items||[]).map(t=>renderItem(t,20))}
                      </div>
                    );
                  })}
                </>}
              </div>
            );
          })}
        </div>

        <div style={{padding:"12px 16px",borderTop:`1px solid ${bdr}`,fontSize:10,color:mut,textTransform:"uppercase",letterSpacing:"0.08em"}}>
          Secured · Supabase
        </div>
      </aside>

      {/* ── Mobile Header ── */}
      <div style={{display:"none"}} className="mobile-header">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:surf,borderBottom:`1px solid ${bdr}`}}>
          <div style={{fontSize:18,fontWeight:700,color:txt,letterSpacing:"-0.03em"}}>PointsVault</div>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:txt}}>☰</button>
        </div>
        {menuOpen&&(
          <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.3)"}} onClick={()=>setMenuOpen(false)}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:280,background:surf,overflowY:"auto",boxShadow:"0 4px 16px rgba(0,0,0,0.08)"}} onClick={e=>e.stopPropagation()}>
              <div style={{padding:"20px 20px 12px",borderBottom:`1px solid ${bdr}`}}>
                <div style={{fontSize:18,fontWeight:700,color:txt}}>PointsVault</div>
              </div>
              {NAV.map((section,si)=>(
                <div key={si}>
                  {(()=>{
                    if(section.comingSoon&&!(section.items||[]).length&&!(section.sub||[]).length)
                      return <div style={{padding:"10px 20px",fontSize:13,color:mut,opacity:0.4,borderBottom:`1px solid ${bdr}`,display:"flex",justifyContent:"space-between"}}>{section.section}<span style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.07em"}}>soon</span></div>;
                    return <div key="nav-section">
                      <div style={{fontSize:9,fontWeight:600,color:mut,letterSpacing:"0.1em",textTransform:"uppercase",padding:"10px 20px 4px",background:surf3}}>{section.section}</div>
                      {(section.items||[]).map(t=>t.comingSoon?(
                        <div key={t.id} style={{padding:"9px 20px",fontSize:13,color:mut,opacity:0.4,borderBottom:`1px solid ${bdr}`,display:"flex",justifyContent:"space-between"}}>{t.label}<span style={{fontSize:9,textTransform:"uppercase"}}>soon</span></div>
                      ):(
                        <div key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}} style={{padding:"9px 20px",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?txt:mut,background:tab===t.id?surf2:"transparent",borderBottom:`1px solid ${bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span>{t.label}</span>{t.beta&&<span style={{fontSize:9,color:acc,fontWeight:600,textTransform:"uppercase"}}>beta</span>}
                        </div>
                      ))}
                      {(section.sub||[]).map((sub,subi)=>(
                        <div key={subi}>
                          <div style={{fontSize:9,fontWeight:600,color:mut,letterSpacing:"0.08em",textTransform:"uppercase",padding:"8px 28px 3px",background:surf2}}>{sub.label}</div>
                          {(sub.items||[]).map(t=>(
                            <div key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}} style={{padding:"9px 28px",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?txt:mut,background:tab===t.id?surf2:"transparent",borderBottom:`1px solid ${bdr}`}}>{t.label}</div>
                          ))}
                        </div>
                      ))}
                    </div>;
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width:700px){
          aside{display:none!important;}
          .mobile-header{display:block!important;}
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;}
      `}</style>

      {/* ── Main content ── */}
      <main style={{flex:1,overflowY:"auto",padding:"28px 32px",background:bg}}>
        <style>{`
          @media(max-width:700px){main{padding:16px!important;}}
          .ov-grid{display:grid;grid-template-columns:1fr 1fr;gap:16;margin-bottom:0}
          .ov-col{display:flex;flex-direction:column}
          @media(max-width:700px){
            .ov-grid{display:flex!important;flex-direction:column!important;}
            .ov-col{width:100%!important;}
          }
        `}</style>
        {tab==="overview"          &&<Overview db={db} owners={owners} onNavigate={setTab}/>}
        {tab==="my-cards"          &&<MyCards db={db} owners={owners}/>}
        {tab==="my-programs"       &&<MyPrograms db={db} owners={owners}/>}
        {tab==="transfer"          &&<TransferPoints db={db} owners={owners}/>}
        {tab==="transfer-history"  &&<TransferHistory db={db} owners={owners}/>}
        {tab==="vouchers"          &&<Vouchers db={db} owners={owners}/>}
        {tab==="pm-setup-owners"   &&<SetupOwners db={db} owners={owners} reloadOwners={()=>loadOwners()}/>}
        {tab==="pm-setup-catalog"  &&<Catalog db={db}/>}
        {tab==="spend-setup-people"&&<SetupPeople db={db}/>}
        {tab==="spend-setup-categories"&&<SetupCategories db={db}/>}
        {tab==="settings-general"  &&<SettingsGeneral db={db} onDisconnect={()=>setDb(null)}/>}
        {tab==="settings-danger"   &&<SettingsDanger db={db} owners={owners} onReset={()=>setDb(null)}/>}
        {tab==="spend-upload"      &&<SpendUpload db={db} owners={owners}/>}
        {tab==="spend-overview"    &&<SpendOverview db={db} owners={owners}/>}
        {tab==="spend-cards"       &&<SpendCards db={db} owners={owners} onNavigate={setTab}/>}
        {tab==="spend-ledger"      &&<SpendLedger db={db} owners={owners}/>}
      </main>
    </div>
  );
}


// ── SpendOverview ──────────────────────────────────────────────────────────────
function SpendOverview({db,owners}){
  const [txns,setTxns]=useState([]);
  const [cards,setCards]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [busy,setBusy]=useState(true);

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,c,mc]=await Promise.all([
      db.from("spend_transactions").select(),
      db.from("my_cards").select(),
      db.from("master_cards").select(),
    ]);
    setTxns(t.data||[]); setCards(c.data||[]); setMCards(mc.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  if(busy) return <div style={{color:mut,padding:32}}>Loading…</div>;

  const now=new Date();
  const ytdStart=now.getFullYear()+"-01-01";
  const thisMonth=now.toISOString().slice(0,7);
  const ytdSpend=txns.filter(t=>t.txn_date>=ytdStart&&Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);
  const monthSpend=txns.filter(t=>(t.statement_month||t.txn_date?.slice(0,7))===thisMonth&&Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);
  const totalSpend=txns.filter(t=>Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);

  const catTotals={};
  txns.forEach(t=>{catTotals[t.category||"Other"]=(catTotals[t.category||"Other"]||0)+Number(t.amount||0);});
  const topCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,6);

  const cardSpend=cards.map(c=>{
    const m=mCards.find(x=>x.id===c.master_id);
    const spend=txns.filter(t=>t.card_id===c.id).reduce((a,t)=>a+Number(t.amount||0),0);
    return{name:c.nickname||m?.name||"Card",spend};
  }).filter(c=>c.spend>0).sort((a,b)=>b.spend-a.spend);

  return(
    <div>
      <Hdr title="Spend Overview" sub="All cards combined"/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"This Month",value:monthSpend},
          {label:"Year to Date",value:ytdSpend},
          {label:"All Time",value:totalSpend},
          {label:"Total Transactions",value:txns.length,plain:true},
        ].map((s,i)=>(
          <Card key={i} style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:18,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{s.plain?s.value:"₹"+s.value.toLocaleString("en-IN")}</div>
          </Card>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Spend by Category</div>
          {topCats.length===0?<div style={{color:mut,fontSize:12}}>No data yet</div>:topCats.map(([cat,val],i)=>(
            <div key={i} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                <span style={{color:txt}}>{cat}</span>
                <span style={{fontWeight:600,color:txt}}>₹{val.toLocaleString("en-IN")}</span>
              </div>
              <div style={{height:4,background:bdr,borderRadius:2}}>
                <div style={{height:4,background:acc,borderRadius:2,width:totalSpend>0?((val/totalSpend)*100)+"%":"0%"}}/>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Spend by Card</div>
          {cardSpend.length===0?<div style={{color:mut,fontSize:12}}>No data yet</div>:cardSpend.map((c,i)=>(
            <div key={i} style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:12}}>
                <span style={{color:txt}}>{c.name}</span>
                <span style={{fontWeight:600,color:txt}}>₹{c.spend.toLocaleString("en-IN")}</span>
              </div>
              <div style={{height:4,background:bdr,borderRadius:2}}>
                <div style={{height:4,background:grn,borderRadius:2,width:totalSpend>0?((c.spend/totalSpend)*100)+"%":"0%"}}/>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}


function SpendCardDetail({card,mCard,db,owners,onBack,allCards,allMCards}){
  const [txns,setTxns]=useState([]);
  const [stmts,setStmts]=useState([]);
  const [busy,setBusy]=useState(true);
  const [page,setPage]=useState(0);
  const [txnSearch,setTxnSearch]=useState("");
  const [txnSort,setTxnSort]=useState("date-desc");
  const [colW,setColW]=useState([90,200,120,90,140,90]); // date,desc,cat,amt,split,stmt
  const [pieMyShareOnly,setPieMyShareOnly]=useState(false);
  const [pieExcludeCats,setPieExcludeCats]=useState(new Set());
  const [showPieFilter,setShowPieFilter]=useState(false);
  const [showStmts,setShowStmts]=useState(false);
  const [selStmt,setSelStmt]=useState(null);
  const [showEditCard,setShowEditCard]=useState(false);
  const [deleting,setDeleting]=useState(false);
  const [people,setPeople]=useState([]);
  const PAGE=15;

  const [splitsMap,setSplitsMap]=useState({});

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,s]=await Promise.all([
      db.from("spend_transactions").filter("card_id",card.id),
      db.from("statements").filter("card_id",card.id),
    ]);
    const txnList=(t.data||[]).sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date));
    setTxns(txnList);
    setStmts((s.data||[]).sort((a,b)=>b.statement_month?.localeCompare(a.statement_month||"")||0));
    // Load splits for reimbursable transactions
    const reimbIds=txnList.filter(x=>x.is_reimbursable).map(x=>x.id);
    if(reimbIds.length>0){
      const {data:sp}=await db.from("transaction_splits").select();
      const map={};
      (sp||[]).forEach(s=>{if(!map[s.transaction_id])map[s.transaction_id]=[];map[s.transaction_id].push(s);});
      setSplitsMap(map);
    }
    const {data:ppl}=await db.from("people").select();
    setPeople(ppl||[]);
    setBusy(false);
  },[db,card.id]);
  useEffect(()=>{load();},[load]);

  const owner=owners.find(o=>o.id===card.owner_id);

  // Stats
  const now=new Date();
  const ytdStart=now.getFullYear()+"-01-01";
  const ytdSpend=txns.filter(t=>t.txn_date>=ytdStart&&Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);
  const lastStmt=stmts[0];
  const lastStmtSpend=txns.filter(t=>t.statement_month===lastStmt?.statement_month&&Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);

  // Billing YTD
  let billingYtdSpend=null;
  let billingYtdMsg=null;
  if(card.billing_year_start){
    const [bm,bd]=card.billing_year_start.split("-").map(Number);
    let billingStart=new Date(now.getFullYear(),bm-1,bd);
    if(billingStart>now) billingStart=new Date(now.getFullYear()-1,bm-1,bd);
    const bStartStr=billingStart.toISOString().split("T")[0];
    billingYtdSpend=txns.filter(t=>t.txn_date>=bStartStr&&Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);
  } else {
    billingYtdMsg="Set billing year start in card settings";
  }

  // Category breakdown for pie chart (with filters)
  const catTotals={};
  txns.forEach(t=>{
    if(pieExcludeCats.has(t.category||"Other")) return;
    let amt=Number(t.amount||0);
    if(pieMyShareOnly&&t.is_reimbursable&&splitsMap[t.id]){
      const mine=splitsMap[t.id].find(s=>s.is_personal);
      amt=Number(mine?.amount||0);
    }
    if(amt>0) catTotals[t.category||"Other"]=(catTotals[t.category||"Other"]||0)+amt;
  });
  const catData=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const total=catData.reduce((a,[,v])=>a+v,0);
  const allCategories=[...new Set(txns.map(t=>t.category||"Other"))].sort();
  const PIE_COLORS=["#b07d3a","#2d6a4f","#9b2335","#7c6fcd","#2980b9","#e67e22","#16a085","#8a8883"];

  // Pie chart SVG
  const makePie=()=>{
    if(!total||catData.length===0) return null;
    let angle=0;
    const cx=80,cy=80,r=70;
    const slices=catData.map(([cat,val],i)=>{
      const pct=val/total;
      const a1=angle; const a2=angle+pct*2*Math.PI;
      angle=a2;
      const x1=cx+r*Math.sin(a1),y1=cy-r*Math.cos(a1);
      const x2=cx+r*Math.sin(a2),y2=cy-r*Math.cos(a2);
      const large=pct>0.5?1:0;
      return{cat,val,pct,color:PIE_COLORS[i%PIE_COLORS.length],
        d:`M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`};
    });
    return slices;
  };
  const pieSlices=makePie();

  // Search + sort + pagination
  const filteredTxns=txns.filter(t=>!txnSearch||t.description?.toLowerCase().includes(txnSearch.toLowerCase())||t.category?.toLowerCase().includes(txnSearch.toLowerCase()));
  const sortedTxns=[...filteredTxns].sort((a,b)=>{
    const[sk,sd]=txnSort.split("-");
    let v=0;
    if(sk==="date") v=new Date(a.txn_date)-new Date(b.txn_date);
    else if(sk==="amount") v=Number(a.amount||0)-Number(b.amount||0);
    else if(sk==="category") v=(a.category||"").localeCompare(b.category||"");
    return sd==="desc"?-v:v;
  });
  const totalPages=Math.ceil(sortedTxns.length/PAGE);
  const pageTxns=sortedTxns.slice(page*PAGE,(page+1)*PAGE);

  // Delete statement
  const deleteStmt=async(stmt)=>{
    setDeleting(true);
    // Check for ledger entries
    const stmtTxnIds=(txns.filter(t=>
      t.statement_id===stmt.id ||
      (!t.statement_id && t.statement_month===stmt.statement_month && t.card_id===stmt.card_id)
    )).map(t=>t.id);
    let ledgerCount=0;
    for(const tid of stmtTxnIds){
      const {data:le}=await db.from("ledger_entries").filter("transaction_id",tid);
      ledgerCount+=(le||[]).length;
    }
    let deleteLedger=false;
    if(ledgerCount>0){
      const ans=confirm(`This statement has ${ledgerCount} linked ledger entr${ledgerCount>1?"ies":"y"}. Delete them too?`);
      if(ans===null) return; // cancelled
      deleteLedger=ans;
    } else {
      if(!confirm(`Delete statement ${stmt.statement_month} and all its ${stmtTxnIds.length} transactions?`)) return;
    }
    if(deleteLedger){
      for(const tid of stmtTxnIds){
        const {data:le}=await db.from("ledger_entries").filter("transaction_id",tid);
        for(const e of (le||[])) await db.from("ledger_entries").delete(e.id);
      }
    }
    // Delete transactions — by statement_id OR by card+month (for legacy imports)
    const allTxns=txns.filter(t=>
      t.statement_id===stmt.id ||
      (!t.statement_id && t.statement_month===stmt.statement_month && t.card_id===stmt.card_id)
    );
    for(const t of allTxns) await db.from("spend_transactions").delete(t.id);
    // Delete statement
    await db.from("statements").delete(stmt.id);
    setDeleting(false);
    load();
  };

  // Reassign statement
  const [reassignTarget,setReassignTarget]=useState(null);
  const [reassignCardId,setReassignCardId]=useState("");
  const [editMonthStmt,setEditMonthStmt]=useState(null);
  const [editMonthM,setEditMonthM]=useState("");
  const [editMonthY,setEditMonthY]=useState("");
  const doReassign=async()=>{
    if(!reassignCardId||!reassignTarget) return;
    await db.from("statements").update(reassignTarget.id,{card_id:reassignCardId});
    const stmtTxns=txns.filter(t=>t.statement_id===reassignTarget.id);
    for(const t of stmtTxns) await db.from("spend_transactions").update(t.id,{card_id:reassignCardId});
    setReassignTarget(null); setReassignCardId(""); load();
  };

  if(selStmt) return(
    <StmtDetail
      stmt={selStmt}
      db={db} owners={owners}
      onBack={()=>setSelStmt(null)}
      onSave={()=>load()}
    />
  );

  if(reassignTarget) return(
    <div>
      <Hdr title={"Reassign Statement — "+fmtMonth(reassignTarget.statement_month)} sub="Choose a different card for this statement"/>
      <Card style={{maxWidth:480}}>
        {lbl("Assign to card")}
        <select style={inp} value={reassignCardId} onChange={e=>setReassignCardId(e.target.value)}>
          <option value="">Select card…</option>
          {(()=>{
            const grouped={};
            allCards.forEach(c=>{
              const o=owners.find(x=>x.id===c.owner_id);
              const n=o?.name||"Unknown";
              if(!grouped[n]) grouped[n]=[];
              grouped[n].push(c);
            });
            return Object.entries(grouped).map(([on,oc])=>(
              <optgroup key={on} label={"── "+on+" ──"}>
                {oc.map(c=>{const m=allMCards.find(x=>x.id===c.master_id);return<option key={c.id} value={c.id}>{c.nickname||m?.name||c.id}</option>;})}
              </optgroup>
            ));
          })()}
        </select>
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button style={gbtn} onClick={()=>setReassignTarget(null)}>Cancel</button>
          <button style={{...pbtn,flex:1,justifyContent:"center"}} onClick={doReassign}>Reassign Statement</button>
        </div>
      </Card>
    </div>
  );

  if(editMonthStmt) return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setEditMonthStmt(null)} style={{...gbtn,fontSize:12}}>← Cancel</button>
        <div style={{fontSize:18,fontWeight:700,color:txt}}>Rename Statement</div>
      </div>
      <Card style={{maxWidth:400}}>
        <div style={{fontSize:13,color:mut,marginBottom:16}}>Current: <strong style={{color:txt}}>{fmtMonth(editMonthStmt.statement_month)}</strong></div>
        {lbl("Month")}
        <select style={inp} value={editMonthM} onChange={e=>setEditMonthM(e.target.value)}>
          <option value="">Select month…</option>
          {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m,i)=>(
            <option key={m} value={m}>{["January","February","March","April","May","June","July","August","September","October","November","December"][i]}</option>
          ))}
        </select>
        {lbl("Year")}
        <select style={inp} value={editMonthY} onChange={e=>setEditMonthY(e.target.value)}>
          <option value="">Select year…</option>
          {Array.from({length:11},(_,i)=>(new Date().getFullYear()-5+i).toString()).map(y=>(
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={async()=>{
          if(!editMonthM||!editMonthY) return alert("Select both month and year");
          const newM=editMonthY+"-"+editMonthM;
          await db.from("statements").update(editMonthStmt.id,{statement_month:newM});
          // Update all transactions linked to this statement
          const {data:ts}=await db.from("spend_transactions").filter("statement_id",editMonthStmt.id);
          for(const t of (ts||[])) await db.from("spend_transactions").update(t.id,{statement_month:newM});
          setEditMonthStmt(null); load();
        }}>Save New Month</button>
      </Card>
    </div>
  );

  if(showStmts) return(
    <div>
      {deleting&&<div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{background:surf,borderRadius:14,padding:"24px 32px",textAlign:"center",boxShadow:"0 8px 32px rgba(0,0,0,0.15)"}}>
          <div style={{fontSize:24,marginBottom:8}}>🗑️</div>
          <div style={{fontSize:14,fontWeight:600,color:txt}}>Deleting statement…</div>
          <div style={{fontSize:12,color:mut,marginTop:4}}>Removing transactions and ledger entries</div>
        </div>
      </div>}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button onClick={()=>setShowStmts(false)} style={{...gbtn,fontSize:12}}>← Back to card</button>
        <div style={{fontSize:18,fontWeight:700,color:txt}}>Statements — {card.nickname||mCard?.name}</div>
      </div>
      {stmts.length===0?<Empty icon="S" msg="No statements uploaded yet"/>:(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {stmts.map(s=>(
            <Card key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div style={{cursor:"pointer"}} onClick={()=>setSelStmt(s)}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontSize:14,fontWeight:700,color:acc,textDecoration:"underline",textDecorationStyle:"dotted"}}>{fmtMonth(s.statement_month)}</div>
                  <button onClick={e=>{e.stopPropagation();const cur=s.statement_month||"";setEditMonthStmt(s);setEditMonthM(cur?cur.split("-")[1]:"");setEditMonthY(cur?cur.split("-")[0]:String(new Date().getFullYear()));}}
                    style={{fontSize:10,color:mut,background:"none",border:`1px solid ${bdr}`,borderRadius:6,padding:"1px 8px",cursor:"pointer",fontFamily:"'Manrope',sans-serif"}}>✏ rename</button>
                </div>
                <div style={{fontSize:11,color:mut,marginTop:2}}>
                  {s.transaction_count||0} transactions · ₹{Number(s.total_spend||0).toLocaleString("en-IN")}
                  {s.file_name&&<span style={{marginLeft:8,opacity:0.6}}>· {s.file_name}</span>}
                  {s.uploaded_at&&<span style={{marginLeft:8,opacity:0.6}}>· Uploaded {new Date(s.uploaded_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</span>}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={{...gbtn,fontSize:11,padding:"4px 12px"}} onClick={()=>{setReassignTarget(s);setReassignCardId(s.card_id||"");}}>Change card</button>
                <button style={{...dbtn,fontSize:11,padding:"4px 12px",opacity:deleting?0.5:1,pointerEvents:deleting?"none":"auto"}} onClick={()=>deleteStmt(s)}>Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={onBack} style={{...gbtn,fontSize:12}}>← My Cards</button>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em"}}>{card.nickname||mCard?.name}</div>
            <div style={{fontSize:12,color:mut,marginTop:2}}>{owner?.name||""}{mCard?.bank?" · "+mCard.bank:""}{mCard?.network?" · "+mCard.network:""}{card.last4?" · ····"+card.last4:""}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{...gbtn,fontSize:12}} onClick={()=>setShowStmts(true)}>View Statements ({stmts.length})</button>
          <button style={pbtn} onClick={()=>setShowEditCard(true)}>Edit Card</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:20}}>
        {[
          {label:"Amount Due",value:lastStmt?.total_due||0,color:lastStmt?.total_due>0?red:mut,note:!lastStmt?.total_due?"Not set — re-import stmt":null},
          {label:"YTD Spends",value:ytdSpend},
          {label:"Last Statement"+(lastStmt?" ("+fmtMonth(lastStmt.statement_month)+")":""),value:lastStmtSpend,show:!!lastStmt},
          {label:"Billing YTD",value:billingYtdSpend,msg:billingYtdMsg},
        ].map((s,i)=>(
          <Card key={i} style={{padding:"14px 16px"}}>
            <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>{s.label}</div>
            {s.msg?<div style={{fontSize:11,color:acc}}>{s.msg}</div>:
            <div style={{fontSize:18,fontWeight:700,color:s.color||txt,fontFamily:"'Manrope',sans-serif"}}>₹{(s.value||0).toLocaleString("en-IN")}</div>}
            {s.note&&<div style={{fontSize:10,color:mut,marginTop:3}}>{s.note}</div>}
          </Card>
        ))}
        <Card style={{padding:"14px 16px"}}>
          <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:6}}>Total Transactions</div>
          <div style={{fontSize:18,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif"}}>{txns.length}</div>
        </Card>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
        {pieSlices&&pieSlices.length>0&&<Card>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
            <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em"}}>Spend by Category</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <label style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:11,color:mut}}>
                <input type="checkbox" checked={pieMyShareOnly} onChange={e=>setPieMyShareOnly(e.target.checked)} style={{accentColor:acc}}/>
                My share only
              </label>
              <div style={{position:"relative"}}>
                <button style={{...gbtn,fontSize:10,padding:"3px 10px"}} onClick={()=>setShowPieFilter(f=>!f)}>
                  Filter {pieExcludeCats.size>0?`(${pieExcludeCats.size} hidden)`:""}
                </button>
                {showPieFilter&&<div style={{position:"absolute",right:0,top:"100%",zIndex:10,background:surf,border:`1px solid ${bdr}`,borderRadius:10,padding:"10px 12px",minWidth:180,boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                  <div style={{fontSize:10,color:mut,marginBottom:6,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.07em"}}>Hide categories</div>
                  {allCategories.map(cat=>(
                    <label key={cat} style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",padding:"3px 0",fontSize:12,color:txt}}>
                      <input type="checkbox" checked={pieExcludeCats.has(cat)} onChange={e=>{setPieExcludeCats(prev=>{const n=new Set(prev);e.target.checked?n.add(cat):n.delete(cat);return n;});}} style={{accentColor:acc}}/>
                      {cat}
                    </label>
                  ))}
                  <button style={{...gbtn,fontSize:10,marginTop:8,width:"100%"}} onClick={()=>{setPieExcludeCats(new Set());setShowPieFilter(false);}}>Clear all</button>
                </div>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <svg width="110" height="110" viewBox="0 0 160 160" style={{flexShrink:0}}>
              {pieSlices.map((s,i)=>(
                <path key={i} d={s.d} fill={s.color} stroke={surf} strokeWidth="1.5" opacity="0.9"/>
              ))}
            </svg>
            <div style={{flex:1}}>
              {pieSlices.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:11,color:txt}}>{s.cat}</span>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,color:txt,marginLeft:8}}>{(s.pct*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>}
        <Card>
          <div style={{fontSize:10,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Spend by Statement</div>
          {stmts.length===0?<div style={{color:mut,fontSize:12}}>No statements yet</div>:(
            <div>
              {stmts.slice(0,6).map((s,i)=>{
                const stmtTotal=txns.filter(t=>t.statement_month===s.statement_month).reduce((a,t)=>a+Number(t.amount||0),0);
                const maxStmt=Math.max(...stmts.slice(0,6).map(st=>txns.filter(t=>t.statement_month===st.statement_month).reduce((a,t)=>a+Number(t.amount||0),0)));
                return(
                  <div key={s.id} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:11}}>
                      <span style={{color:txt}}>{fmtMonth(s.statement_month)}</span>
                      <span style={{fontWeight:600,color:txt}}>₹{stmtTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div style={{height:5,background:surf3,borderRadius:3}}>
                      <div style={{height:5,background:acc,borderRadius:3,width:maxStmt>0?((stmtTotal/maxStmt)*100)+"%":"0%",transition:"width 0.3s"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <input style={{...inp,marginBottom:0,flex:1,minWidth:160,fontSize:12}} placeholder="Search transactions…" value={txnSearch} onChange={e=>{setTxnSearch(e.target.value);setPage(0);}}/>
          <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={txnSort} onChange={e=>setTxnSort(e.target.value)}>
            <option value="date-asc">Date (oldest first)</option>
            <option value="date-desc">Date (newest first)</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
            <option value="category-asc">Category A-Z</option>
          </select>
          {totalPages>1&&<div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:mut}}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{...gbtn,padding:"3px 8px",opacity:page===0?0.4:1}}>←</button>
            <span>{page+1}/{totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} style={{...gbtn,padding:"3px 8px",opacity:page===totalPages-1?0.4:1}}>→</button>
          </div>}
        </div>
        {busy?<div style={{color:mut,padding:16}}>Loading…</div>:txns.length===0?<div style={{color:mut,fontSize:12,textAlign:"center",padding:24}}>No transactions yet — upload a statement</div>:(
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <colgroup>
              {colW.map((w,i)=><col key={i} style={{width:w,minWidth:i===1?100:60}}/>)}
            </colgroup>
            <thead>
              <tr style={{borderBottom:`2px solid ${bdr}`,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:mut}}>
                {["Date","Description","Category","Amount","Split","Stmt"].map((label,ci)=>(
                  <th key={ci} style={{padding:"6px 8px",textAlign:ci===3?"right":"left",position:"relative",userSelect:"none",background:surf}}>
                    {label}
                    <span onMouseDown={e=>{e.preventDefault();const sx=e.clientX;const sw=colW[ci];const mv=mv=>{setColW(w=>{const n=[...w];n[ci]=Math.max(ci===1?80:40,sw+(mv.clientX-sx));return n;});};const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);};document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);}}
                      style={{position:"absolute",right:0,top:"15%",bottom:"15%",width:3,cursor:"col-resize",background:acc+"66",borderRadius:2,transition:"background 0.1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=acc}
                      onMouseLeave={e=>e.currentTarget.style.background=acc+"66"}/>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageTxns.map(t=>(
                <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`,background:t.is_reimbursable?acc+"06":surf}}>
                  <td style={{padding:"7px 8px",color:mut,wordBreak:"break-word"}}>{fmtDate(t.txn_date)}</td>
                  <td style={{padding:"7px 8px",color:txt,wordBreak:"break-word"}}>{t.description}</td>
                  <td style={{padding:"7px 8px",wordBreak:"break-word"}}>
                    <span style={{background:surf2,padding:"2px 7px",borderRadius:10,fontSize:10,color:mut}}>{t.category}</span>
                  </td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontWeight:600,color:txt}}>₹{Number(t.amount||0).toLocaleString("en-IN")}</td>
                  <td style={{padding:"7px 8px",minWidth:100}}>
                    {t.is_reimbursable&&splitsMap[t.id]&&splitsMap[t.id].length>0?(
                      <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                        {splitsMap[t.id].map((sp,si)=>{
                          const pName=sp.is_personal?"Me":people.find(p=>p.id===sp.person_id)?.name||"?";
                          return<span key={si} style={{fontSize:10,background:acc+"12",borderRadius:6,padding:"1px 6px",color:acc,fontWeight:500,whiteSpace:"nowrap"}}>{pName} ₹{Number(sp.amount).toLocaleString("en-IN")}</span>;
                        })}
                      </div>
                    ):<span style={{fontSize:10,color:mut}}>—</span>}
                  </td>
                  <td style={{padding:"7px 8px",textAlign:"center",fontSize:10}}>
                    {t.statement_month?
                      <button onClick={()=>{const s=stmts.find(x=>x.statement_month===t.statement_month);if(s)setSelStmt(s);}} style={{background:"none",border:"none",cursor:"pointer",color:acc,fontSize:10,fontWeight:500,textDecoration:"underline",textDecorationStyle:"dotted",padding:0,fontFamily:"'Manrope',sans-serif"}}>
                        {fmtMonth(t.statement_month)}
                      </button>:"—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages>1&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:12,fontSize:12,color:mut}}>
          <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{...gbtn,padding:"4px 12px",opacity:page===0?0.4:1}}>← Prev</button>
          <span>{page*PAGE+1}–{Math.min((page+1)*PAGE,txns.length)} of {txns.length}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} style={{...gbtn,padding:"4px 12px",opacity:page===totalPages-1?0.4:1}}>Next →</button>
        </div>}
      </Card>
      {showEditCard&&<EditCardModal card={card} db={db} mCards={allMCards} owners={owners} onSave={()=>load()} onClose={()=>setShowEditCard(false)}/>}
    </div>
  );
}

function SpendCards({db,owners,onNavigate}){
  const [cards,setCards]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [stmts,setStmts]=useState([]);
  const [txns,setTxns]=useState([]);
  const [busy,setBusy]=useState(true);
  const [selCard,setSelCard]=useState(null);



  const load=useCallback(async()=>{
    setBusy(true);
    const [c,mc,s,t]=await Promise.all([
      db.from("my_cards").select(),
      db.from("master_cards").select(),
      db.from("statements").select(),
      db.from("spend_transactions").select(),
    ]);
    setCards(c.data||[]); setMCards(mc.data||[]);
    setStmts(s.data||[]); setTxns(t.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const toggleHide=async(card)=>{
    await db.from("my_cards").update(card.id,{hidden_in_spend:!card.hidden_in_spend});
    load();
  };

  const mCard=id=>mCards.find(x=>x.id===cards.find(c=>c.id===id)?.master_id);

  if(selCard){
    const mc=mCards.find(x=>x.id===selCard.master_id);
    return(
      <div>
        <SpendCardDetail
          card={selCard} mCard={mc} db={db} owners={owners}
          allCards={cards} allMCards={mCards}
          onBack={()=>setSelCard(null)}
        />

      </div>
    );
  }

  const visibleCards=cards.filter(c=>!c.hidden_in_spend);
  const hiddenCards=cards.filter(c=>c.hidden_in_spend);
  const cardSpend=id=>txns.filter(t=>t.card_id===id&&Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);
  const cardStmtCount=id=>stmts.filter(s=>s.card_id===id).length;



  return(
    <div>
      <Hdr title="My Cards" sub="Spend tracker view"/>


      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14,marginBottom:16}}>
          {visibleCards.map(card=>{
            const m=mCards.find(x=>x.id===card.master_id);
            const o=owners.find(x=>x.id===card.owner_id);
            const spend=cardSpend(card.id);
            const stmtCount=cardStmtCount(card.id);
            const lastStmt=stmts.filter(s=>s.card_id===card.id).sort((a,b)=>b.statement_month?.localeCompare(a.statement_month||"")||0)[0];
            return(
              <Card key={card.id} style={{cursor:"pointer",position:"relative"}} onClick={()=>setSelCard(card)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:txt,letterSpacing:"-0.02em"}}>{card.nickname||m?.name||"Card"}</div>
                    <div style={{fontSize:11,color:mut,marginTop:2}}>{o?.name||""}{m?.bank?" · "+m.bank:""}{card.last4?" · ····"+card.last4:""}</div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();toggleHide(card);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:mut,padding:"2px 6px"}}>Hide</button>
                </div>
                <div style={{fontSize:20,fontWeight:700,color:txt,fontFamily:"'Manrope',sans-serif",marginBottom:4}}>
                  ₹{spend.toLocaleString("en-IN")}
                </div>
                <div style={{fontSize:11,color:mut}}>{stmtCount} statement{stmtCount!==1?"s":" "}{lastStmt&&"· Last: "+lastStmt.statement_month}</div>
              </Card>
            );
          })}
        </div>
        {hiddenCards.length>0&&<div>
          <div style={{fontSize:11,color:mut,marginBottom:8}}>Hidden ({hiddenCards.length})</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {hiddenCards.map(card=>{
              const m=mCards.find(x=>x.id===card.master_id);
              return <button key={card.id} onClick={()=>toggleHide(card)} style={{...gbtn,fontSize:11}}>{card.nickname||m?.name} — Show</button>;
            })}
          </div>
        </div>}

    </div>
  );
}

// ── SpendTransactions ──────────────────────────────────────────────────────────
function SpendTransactions({db,owners}){
  const [txns,setTxns]=useState([]);
  const [cards,setCards]=useState([]);
  const [mCards,setMCards]=useState([]);
  const [people,setPeople]=useState([]);
  const [busy,setBusy]=useState(true);
  const [filterCard,setFilterCard]=useState("all");
  const [filterCat,setFilterCat]=useState("all");
  const [filterMonth,setFilterMonth]=useState("all");
  const [search,setSearch]=useState("");
  const [editId,setEditId]=useState(null);
  const [editRow,setEditRow]=useState(null);
  const [categories,setCategories]=useState([]);
  const [showSplit,setShowSplit]=useState(null); // transaction being split
  const [splits,setSplits]=useState([]); // [{person_id,amount,is_personal}]

  const load=useCallback(async()=>{
    setBusy(true);
    const [t,c,mc,p,cats]=await Promise.all([
      db.from("spend_transactions").select(),
      db.from("my_cards").select(),
      db.from("master_cards").select(),
      db.from("people").select(),
      db.from("spend_categories").select(),
    ]);
    setTxns((t.data||[]).sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    setCards(c.data||[]); setMCards(mc.data||[]);
    setPeople(p.data||[]);
    setCategories((cats.data||[]).map(x=>x.name).sort());
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const months=[...new Set(txns.map(t=>t.statement_month||t.txn_date?.slice(0,7)).filter(Boolean))].sort().reverse();
  const cardName=id=>{const c=cards.find(x=>x.id===id);const m=mCards.find(x=>x.id===c?.master_id);return c?.nickname||m?.name||"Unknown";};

  const filtered=txns.filter(t=>{
    if(filterCard!=="all"&&t.card_id!==filterCard) return false;
    if(filterCat!=="all"&&t.category!==filterCat) return false;
    if(filterMonth!=="all"&&(t.statement_month||t.txn_date?.slice(0,7))!==filterMonth) return false;
    if(search&&!t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalFiltered=filtered.reduce((a,t)=>a+Number(t.amount||0),0);

  const saveEdit=async()=>{
    await db.from("spend_transactions").update(editId,{
      category:editRow.category,
      is_reimbursable:editRow.is_reimbursable,
      person_id:editRow.person_id||null,
      description:editRow.description,
    });
    setEditId(null); load();
  };

  const del=async id=>{
    if(!confirm("Delete this transaction?")) return;
    await db.from("spend_transactions").delete(id);
    load();
  };

  // Split logic
  const openSplit=async t=>{
    setShowSplit(t);
    const {data:existing}=await db.from("transaction_splits").filter("transaction_id",t.id);
    if(existing&&existing.length>0){
      setSplits(existing.map(s=>({person_id:s.person_id||"",amount:Number(s.amount),is_personal:!!s.is_personal})));
    } else {
      setSplits([{person_id:"",amount:Number(t.amount),is_personal:true}]);
    }
  };
  const addSplit=()=>setSplits(prev=>{
    const newSplits=[...prev,{person_id:"",amount:0,is_personal:false}];
    // Mine stays the same when adding a new 0-amount person
    return newSplits;
  });
  const updSplit=(i,k,v)=>setSplits(prev=>{
    const updated=prev.map((s,si)=>si===i?{...s,[k]:v}:s);
    // Auto-recalculate "Mine" = total - sum of others
    const othersTotal=updated.filter(s=>!s.is_personal).reduce((a,s)=>a+Number(s.amount||0),0);
    const total=Number(showSplit?.amount||0);
    // For credits (negative total), mine = total - others (can be negative)
    const myAmt=total<0?Math.min(0,total-othersTotal):Math.max(0,total-othersTotal);
    return updated.map(s=>s.is_personal?{...s,amount:myAmt}:s);
  });
  const removeSplit=i=>setSplits(prev=>prev.filter((_,si)=>si!==i));
  const splitTotal=splits.reduce((a,s)=>a+Number(s.amount||0),0);
  const splitRemaining=showSplit?(showSplit.amount-splitTotal):0;

  const saveSplit=async()=>{
    if(Math.abs(splitRemaining)>0.01) return alert("Splits must add up to "+inrFmt(Math.abs(Number(showSplit.amount))));
    const unassigned=splits.filter(s=>!s.is_personal&&!s.person_id);
    if(unassigned.length>0) return alert("Please select a person for each split row, or remove the empty rows.");
    // Delete existing splits AND ledger entries for this transaction
    const {data:existingSplits}=await db.from("transaction_splits").filter("transaction_id",showSplit.id);
    for(const s of (existingSplits||[])) await db.from("transaction_splits").delete(s.id);
    const {data:existingLedger}=await db.from("ledger_entries").filter("transaction_id",showSplit.id);
    for(const e of (existingLedger||[])) await db.from("ledger_entries").delete(e.id);
    // Insert new splits + ledger entries
    for(const s of splits){
      if(Number(s.amount)===0) continue;
      await db.from("transaction_splits").insert({
        transaction_id:showSplit.id,
        person_id:s.is_personal?null:(s.person_id||null),
        amount:Number(s.amount),
        is_personal:s.is_personal,
      });
      if(!s.is_personal&&s.person_id){
        await db.from("ledger_entries").insert({
          person_id:s.person_id,
          amount:Math.abs(Number(s.amount)),
          direction:Number(s.amount)<0?"i_owe":"owed_to_me",
          description:showSplit.description||"CC transaction",
          entry_date:showSplit.txn_date,
          entry_type:"transaction",
          transaction_id:showSplit.id,
        });
      }
    }
    // Mark transaction as reimbursable if any non-personal split
    const hasReimb=splits.some(s=>!s.is_personal&&s.person_id);
    await db.from("spend_transactions").update(showSplit.id,{is_reimbursable:hasReimb});
    setShowSplit(null); load();
  };

  const ss2={...{fontSize:11,border:`1px solid ${bdr}`,borderRadius:6,padding:"4px 8px",background:surf,color:txt,fontFamily:"'Manrope',sans-serif",outline:"none"}};

  return(
    <div>
      <Hdr title="Transactions" sub={`${filtered.length} transactions · ₹${totalFiltered.toLocaleString("en-IN")}`}/>
      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input style={{...inp,marginBottom:0,flex:1,minWidth:160,fontSize:12}} placeholder="Search descriptions…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={filterCard} onChange={e=>setFilterCard(e.target.value)}>
          <option value="all">All cards</option>
          {cards.map(c=><option key={c.id} value={c.id}>{cardName(c.id)}</option>)}
        </select>
        <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={filterMonth} onChange={e=>setFilterMonth(e.target.value)}>
          <option value="all">All months</option>
          {months.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {busy?<div style={{color:mut}}>Loading…</div>:filtered.length===0?<Empty icon="T" msg="No transactions found"/>:(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{borderBottom:`2px solid ${bdr}`,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:mut}}>
                <th style={{padding:"8px 10px",textAlign:"left"}}>Date</th>
                <th style={{padding:"8px 10px",textAlign:"left"}}>Description</th>
                <th style={{padding:"8px 10px",textAlign:"left"}}>Card</th>
                <th style={{padding:"8px 10px",textAlign:"left"}}>Category</th>
                <th style={{padding:"8px 10px",textAlign:"right"}}>Amount</th>
                <th style={{padding:"8px 10px",textAlign:"center"}}>Split</th>
                <th style={{padding:"8px 10px",textAlign:"center"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`,background:t.is_reimbursable?acc+"06":surf}}>
                  <td style={{padding:"8px 10px",color:mut,whiteSpace:"nowrap"}}>{fmtDate(t.txn_date)}</td>
                  <td style={{padding:"8px 10px",color:txt,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {editId===t.id?<input style={{...ss2,width:"100%"}} value={editRow.description} onChange={e=>setEditRow(r=>({...r,description:e.target.value}))}/>:t.description}
                  </td>
                  <td style={{padding:"8px 10px",color:mut,whiteSpace:"nowrap"}}>{cardName(t.card_id)}</td>
                  <td style={{padding:"8px 10px"}}>
                    {editId===t.id?
                      <select style={ss2} value={editRow.category} onChange={e=>setEditRow(r=>({...r,category:e.target.value}))}>
                        {categories.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>:
                      <span style={{background:surf2,padding:"2px 8px",borderRadius:10,fontSize:11}}>{t.category}</span>
                    }
                  </td>
                  <td style={{padding:"8px 10px",textAlign:"right",fontWeight:600,color:txt}}>₹{Number(t.amount||0).toLocaleString("en-IN")}</td>
                  <td style={{padding:"8px 10px",maxWidth:160}}>
                    {t.is_reimbursable&&splitsMap[t.id]?(
                      <div style={{fontSize:10,color:acc,lineHeight:1.6}}>
                        {splitsMap[t.id].map((sp,si)=>{
                          const pName=sp.is_personal?"Me":people.find(p=>p.id===sp.person_id)?.name||"?";
                          return<span key={si} style={{display:"inline-block",background:acc+"12",borderRadius:6,padding:"1px 6px",marginRight:3,marginBottom:2,whiteSpace:"nowrap"}}>{pName} ₹{Number(sp.amount).toLocaleString("en-IN")}</span>;
                        })}
                      </div>
                    ):t.is_reimbursable?(
                      <span style={{fontSize:10,color:acc}}>Split</span>
                    ):(
                      <span style={{fontSize:10,color:mut}}>—</span>
                    )}
                  </td>
                  <td style={{padding:"8px 10px",textAlign:"center"}}>
                    {editId===t.id?(
                      <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                        <button style={{...gbtn,padding:"2px 8px",fontSize:11}} onClick={saveEdit}>Save</button>
                        <button style={{...gbtn,padding:"2px 8px",fontSize:11}} onClick={()=>setEditId(null)}>Cancel</button>
                      </div>
                    ):(
                      <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                        <button style={{...gbtn,padding:"2px 8px",fontSize:11}} onClick={()=>{setEditId(t.id);setEditRow({...t});}}>Edit</button>
                        <button style={{...dbtn,padding:"2px 8px",fontSize:11}} onClick={()=>del(t.id)}>Del</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Rule Modal */}
      <Modal show={!!showCreateRule} onClose={()=>setShowCreateRule(null)} title="Save as Auto-Rule?">
        {showCreateRule&&<>
          <div style={{fontSize:13,color:mut,marginBottom:16,lineHeight:1.6}}>
            Create a rule: if a transaction description contains <strong style={{color:txt}}>"{showCreateRule.keyword}"</strong>, automatically set category to <strong style={{color:txt}}>{showCreateRule.category}</strong>.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div>
              {lbl("Keyword")}
              <input style={inp} value={showCreateRule.keyword} onChange={e=>setShowCreateRule(r=>({...r,keyword:e.target.value}))}/>
            </div>
            <div>
              {lbl("Category")}
              <select style={inp} value={showCreateRule.category} onChange={e=>setShowCreateRule(r=>({...r,category:e.target.value}))}>
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{...gbtn,flex:1,justifyContent:"center"}} onClick={()=>setShowCreateRule(null)}>Skip</button>
            <button style={{...pbtn,flex:1,justifyContent:"center"}} onClick={async()=>{
              await db.from("merchant_rules").insert({keyword:showCreateRule.keyword.toLowerCase(),category:showCreateRule.category});
              setShowCreateRule(null);
            }}>Save Rule</button>
          </div>
        </>}
      </Modal>

      {/* Split Modal */}
      <Modal show={!!showSplit} onClose={()=>setShowSplit(null)} title="Split Transaction">
        {showSplit&&<>
          <div style={{fontSize:13,fontWeight:600,color:txt,marginBottom:4}}>{showSplit.description}</div>
          <div style={{fontSize:12,color:mut,marginBottom:16}}>Total: ₹{Number(showSplit.amount).toLocaleString("en-IN")}</div>
          {splits.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:8,alignItems:"center",marginBottom:8,padding:"10px 12px",background:surf2,borderRadius:10,border:`1px solid ${bdr}`}}>
              <div style={{flex:1}}>
                {s.is_personal?(
                  <span style={{fontSize:12,fontWeight:600,color:txt}}>Mine (personal)</span>
                ):(
                  <select style={{...inp,marginBottom:0,fontSize:12}} value={s.person_id} onChange={e=>updSplit(i,"person_id",e.target.value)}>
                    <option value="">Select person…</option>
                    {people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:12,color:mut}}>₹</span>
                <input type="number" style={{...inp,marginBottom:0,width:100,fontSize:12,textAlign:"right"}} value={s.amount} onChange={e=>updSplit(i,"amount",e.target.value)}/>
              </div>
              {!s.is_personal&&<button onClick={()=>removeSplit(i)} style={{background:"none",border:"none",cursor:"pointer",color:red,fontSize:16,padding:"0 4px",lineHeight:1}}>×</button>}
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button style={{...gbtn,fontSize:12}} onClick={addSplit}>+ Add person</button>
            <div style={{flex:1,textAlign:"right",fontSize:12,color:Math.abs(splitRemaining)<0.01?grn:red,fontWeight:600,padding:"8px 0"}}>
              {Math.abs(splitRemaining)<0.01?"✓ Balanced":splitRemaining>0?`-₹${splitRemaining.toLocaleString("en-IN")} unallocated`:`+₹${Math.abs(splitRemaining).toLocaleString("en-IN")} over`}
            </div>
          </div>
          <button style={{...pbtn,width:"100%",justifyContent:"center",opacity:Math.abs(splitRemaining)<0.01?1:0.4}} onClick={saveSplit}>Save Split</button>
        </>}
      </Modal>
    </div>
  );
}

// ── SpendLedger ────────────────────────────────────────────────────────────────
function SpendLedger({db,owners}){
  const [people,setPeople]=useState([]);
  const [entries,setEntries]=useState([]);
  const [busy,setBusy]=useState(true);
  const [selPerson,setSelPerson]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [editEntry,setEditEntry]=useState(null);
  const [youPaid,setYouPaid]=useState("");
  const [theyPaid,setTheyPaid]=useState("");
  const [desc,setDesc]=useState("");
  const [entryDate,setEntryDate]=useState(new Date().toISOString().split("T")[0]);
  const [method,setMethod]=useState("cash");
  const [search,setSearch]=useState("");
  const [filterMethod,setFilterMethod]=useState("all");
  const [sortKey,setSortKey]=useState("date");
  const [sortDir,setSortDir]=useState("asc");
  const [ledgerPage,setLedgerPage]=useState(0);

  const load=useCallback(async()=>{
    setBusy(true);
    const [p,e]=await Promise.all([db.from("people").select(),db.from("ledger_entries").select()]);
    setPeople(p.data||[]); setEntries(e.data||[]);
    setBusy(false);
  },[db]);
  useEffect(()=>{load();},[load]);

  const balance=pid=>{
    const pe=entries.filter(e=>e.person_id===pid);
    return pe.filter(e=>e.direction==="owed_to_me").reduce((a,e)=>a+Number(e.amount||0),0)
          -pe.filter(e=>e.direction==="i_owe").reduce((a,e)=>a+Number(e.amount||0),0);
  };
  const balLabel=(bal,name)=>bal>0?`${name} owes you ₹${Math.abs(bal).toLocaleString("en-IN")}`:bal<0?`You owe ${name} ₹${Math.abs(bal).toLocaleString("en-IN")}`:"Settled";

  const openAdd=()=>{setEditEntry(null);setYouPaid("");setTheyPaid("");setDesc("");setEntryDate(new Date().toISOString().split("T")[0]);setMethod("cash");setShowAdd(true);};
  const openEdit=e=>{setEditEntry(e);setYouPaid(e.direction==="owed_to_me"?String(e.amount||""):"");setTheyPaid(e.direction==="i_owe"?String(e.amount||""):"");setDesc(e.description||"");setEntryDate(e.entry_date||new Date().toISOString().split("T")[0]);setMethod(e.payment_method||"cash");setShowAdd(true);};

  const saveEntry=async()=>{
    const yp=parseFloat(youPaid)||0; const tp=parseFloat(theyPaid)||0;
    if(yp===0&&tp===0) return alert("Enter either You Paid or They Paid amount");
    if(!selPerson) return;
    const data={person_id:selPerson.id,amount:yp||tp,direction:yp>0?"owed_to_me":"i_owe",description:desc||"Manual entry",entry_date:entryDate,entry_type:"manual",payment_method:method};
    if(editEntry) await db.from("ledger_entries").update(editEntry.id,data);
    else await db.from("ledger_entries").insert(data);
    setShowAdd(false); setEditEntry(null);
    setYouPaid(""); setTheyPaid(""); setDesc(""); load();
  };

  const del=async id=>{if(!confirm("Delete this entry?")) return;await db.from("ledger_entries").delete(id);load();};

  if(busy) return <div style={{color:mut,padding:32}}>Loading…</div>;

  if(selPerson){
    const PAGE_SIZE=15;

    // Always sort oldest-first for running balance calculation
    const personEntries=entries.filter(e=>e.person_id===selPerson.id)
      .sort((a,b)=>new Date(a.entry_date)-new Date(b.entry_date));
    let running=0;
    const entriesWithBal=personEntries.map(e=>{
      const yp=e.direction==="owed_to_me"?Number(e.amount||0):0;
      const tp=e.direction==="i_owe"?Number(e.amount||0):0;
      running+=yp-tp; return{...e,_yp:yp,_tp:tp,_bal:running};
    });
    const finalBal=running;

    // Apply search/filter/sort on top of running-balance-enriched entries
    const filtered=entriesWithBal.filter(e=>{
      if(search&&!e.description?.toLowerCase().includes(search.toLowerCase())&&!String(e.amount).includes(search)) return false;
      if(filterMethod!=="all"&&e.payment_method!==filterMethod) return false;
      return true;
    }).sort((a,b)=>{
      let v=0;
      if(sortKey==="date") v=new Date(a.entry_date)-new Date(b.entry_date);
      else if(sortKey==="amount") v=Number(a.amount||0)-Number(b.amount||0);
      else if(sortKey==="desc") v=(a.description||"").localeCompare(b.description||"");
      return sortDir==="desc"?-v:v;
    });
    const totalLedgerPages=Math.ceil(filtered.length/PAGE_SIZE);
    const pageEntries=filtered.slice(ledgerPage*PAGE_SIZE,(ledgerPage+1)*PAGE_SIZE);

    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
          <button onClick={()=>setSelPerson(null)} style={{...gbtn,fontSize:12}}>← Back</button>
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em"}}>{selPerson.name}</div>
            <div style={{fontSize:14,fontWeight:600,color:finalBal>0?grn:finalBal<0?red:mut,marginTop:2}}>{balLabel(finalBal,selPerson.name)}</div>
          </div>
          <button style={pbtn} onClick={openAdd}>+ Add entry</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
          <input style={{...inp,marginBottom:0,flex:1,minWidth:160,fontSize:12}} placeholder="Search description or amount…" value={search} onChange={e=>{setSearch(e.target.value);setLedgerPage(0);}}/>
          <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={filterMethod} onChange={e=>{setFilterMethod(e.target.value);setLedgerPage(0);}}>
            <option value="all">All methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cc">Credit Card</option>
            <option value="other">Other</option>
          </select>
          <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={sortKey+"-"+sortDir} onChange={e=>{const[k,d]=e.target.value.split("-");setSortKey(k);setSortDir(d);}}>
            <option value="date-asc">Date (oldest first)</option>
            <option value="date-desc">Date (newest first)</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
          </select>
        </div>
        <div style={{fontSize:11,color:mut,marginBottom:10,padding:"6px 10px",background:surf2,borderRadius:8}}>
          Auto entries from CC splits — edit via the statement. Manual entries are editable here.
        </div>
        {filtered.length===0?<Empty icon="L" msg="No entries match your filters"/>:(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${bdr}`}}>
                  {["Date","Description","You Paid","They Paid","Balance","Method",""].map((h,i)=>(
                    <th key={i} style={{padding:"8px 10px",textAlign:i>=2&&i<=4?"right":"left",fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:mut,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageEntries.map(e=>(
                  <tr key={e.id} style={{borderBottom:`1px solid ${bdr}`,background:surf}}>
                    <td style={{padding:"8px 10px",color:mut,whiteSpace:"nowrap"}}>{fmtDate(e.entry_date)}</td>
                    <td style={{padding:"8px 10px",color:txt,wordBreak:"break-word"}}>{e.description}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",color:txt,fontWeight:400}}>{e._yp>0?"₹"+e._yp.toLocaleString("en-IN"):"—"}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",color:txt,fontWeight:400}}>{e._tp>0?"₹"+e._tp.toLocaleString("en-IN"):"—"}</td>
                    <td style={{padding:"8px 10px",textAlign:"right",fontWeight:400,color:txt}}>{e._bal===0?"₹0":(e._bal>0?"+":"")+"₹"+e._bal.toLocaleString("en-IN")}</td>
                    <td style={{padding:"8px 10px",fontSize:10,color:mut}}>{e.payment_method||"—"}</td>
                    <td style={{padding:"8px 10px",textAlign:"center",whiteSpace:"nowrap"}}>
                      {e.entry_type==="manual"||e.entry_type==="payment"||!e.entry_type?(
                        <div style={{display:"flex",gap:4,justifyContent:"center"}}>
                          <button onClick={()=>openEdit(e)} style={{...gbtn,padding:"2px 8px",fontSize:10}}>Edit</button>
                          <button onClick={()=>del(e.id)} style={{...dbtn,padding:"2px 8px",fontSize:10}}>Del</button>
                        </div>
                      ):(
                        <span style={{fontSize:9,color:mut,opacity:0.5}}>auto</span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr style={{borderTop:`2px solid ${bdr}`,background:surf2}}>
                  <td colSpan={2} style={{padding:"10px",fontWeight:700,fontSize:12,color:txt}}>Total (all entries)</td>
                  <td style={{padding:"10px",textAlign:"right",fontWeight:700,color:grn,fontSize:12}}>₹{entriesWithBal.reduce((a,e)=>a+e._yp,0).toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px",textAlign:"right",fontWeight:700,color:red,fontSize:12}}>₹{entriesWithBal.reduce((a,e)=>a+e._tp,0).toLocaleString("en-IN")}</td>
                  <td style={{padding:"10px",textAlign:"right",fontWeight:700,fontSize:14,color:finalBal>0?grn:finalBal<0?red:mut}}>{finalBal===0?"₹0":(finalBal>0?"+":"")+"₹"+finalBal.toLocaleString("en-IN")}</td>
                  <td colSpan={2}/>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {totalLedgerPages>1&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,fontSize:12,color:mut}}>
          <button onClick={()=>setLedgerPage(p=>Math.max(0,p-1))} disabled={ledgerPage===0} style={{...gbtn,padding:"4px 14px",opacity:ledgerPage===0?0.4:1}}>← Older</button>
          <span>{ledgerPage*PAGE_SIZE+1}–{Math.min((ledgerPage+1)*PAGE_SIZE,filtered.length)} of {filtered.length}</span>
          <button onClick={()=>setLedgerPage(p=>Math.min(totalLedgerPages-1,p+1))} disabled={ledgerPage===totalLedgerPages-1} style={{...gbtn,padding:"4px 14px",opacity:ledgerPage===totalLedgerPages-1?0.4:1}}>Newer →</button>
        </div>}
        <Modal show={showAdd} onClose={()=>{setShowAdd(false);setEditEntry(null);}} title={editEntry?"Edit Entry":"Add entry — "+selPerson.name}>
          <div style={{background:surf2,borderRadius:10,padding:"10px 12px",marginBottom:14,fontSize:12,color:mut,lineHeight:1.6}}>
            <strong style={{color:txt}}>You Paid</strong> = you spent on their behalf (they owe you)<br/>
            <strong style={{color:txt}}>They Paid</strong> = they paid you back or paid for you
          </div>
          {lbl("Description")}<input style={inp} value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Dinner, repayment…"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>{lbl("You Paid (₹)")}<input type="text" inputMode="decimal" style={inp} placeholder="0" value={youPaid} onChange={e=>{setYouPaid(e.target.value.replace(/[^0-9.]/g,""));if(e.target.value) setTheyPaid("");}}/></div>
            <div>{lbl("They Paid (₹)")}<input type="text" inputMode="decimal" style={inp} placeholder="0" value={theyPaid} onChange={e=>{setTheyPaid(e.target.value.replace(/[^0-9.]/g,""));if(e.target.value) setYouPaid("");}}/></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>{lbl("Date")}<input type="date" style={inp} value={entryDate} onChange={e=>setEntryDate(e.target.value)}/></div>
            <div>{lbl("Method")}<select style={inp} value={method} onChange={e=>setMethod(e.target.value)}>
              <option value="cash">Cash</option><option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option><option value="cc">Credit Card</option>
              <option value="other">Other</option>
            </select></div>
          </div>
          <button style={{...pbtn,width:"100%",justifyContent:"center",marginTop:4}} onClick={saveEntry}>{editEntry?"Save Changes":"Add Entry"}</button>
        </Modal>
      </div>
    );
  }

  return(
    <div>
      <Hdr title="Ledger" sub="Track who owes you and who you owe"/>
      {people.length===0?<Empty icon="L" msg="Add people in Spend Tracker → Setup → People"/>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
          {people.map(p=>{
            const bal=balance(p.id);
            const pe=entries.filter(e=>e.person_id===p.id);
            return(
              <Card key={p.id} style={{cursor:"pointer"}} onClick={()=>setSelPerson(p)}>
                <div style={{fontSize:15,fontWeight:700,color:txt,marginBottom:6}}>{p.name}</div>
                <div style={{fontSize:22,fontWeight:700,fontFamily:"'Manrope',sans-serif",marginBottom:4,color:bal>0?grn:bal<0?red:mut}}>
                  {bal>0?"+":bal<0?"-":""} ₹{Math.abs(bal).toLocaleString("en-IN")}
                </div>
                <div style={{fontSize:11,color:mut}}>{balLabel(bal,p.name)} · {pe.length} entries</div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── StmtDetail ────────────────────────────────────────────────────────────────
function StmtDetail({stmt,db,owners,onBack,onSave}){
  const [txns,setTxns]=useState([]);
  const [people,setPeople]=useState([]);
  const [categories,setCategories]=useState([]);
  const [txnSplitsMap,setTxnSplitsMap]=useState({});
  const [colW,setColW]=useState([90,200,120,90,150,80]);
  const [prevStmtData,setPrevStmtData]=useState(null);
  const [search,setSearch]=useState("");
  const [sortBy,setSortBy]=useState("date");
  const [sortDir,setSortDir]=useState("desc");
  const [editId,setEditId]=useState(null);
  const [editRow,setEditRow]=useState(null);
  const [showSplit,setShowSplit]=useState(null);
  const [splits,setSplits]=useState([]);
  const [page,setPage]=useState(0);
  const PAGE=15;
  const [selected,setSelected]=useState(new Set()); // selected txn ids
  const [bulkCat,setBulkCat]=useState("");
  const [reapplying,setReapplying]=useState(false);
  const [showCreateRule,setShowCreateRule]=useState(null); // {keyword, category}

  const loadData=useCallback(async()=>{
    // Find previous statement (same card, one month prior)
    if(stmt.card_id&&stmt.statement_month){
      const [y,m]=stmt.statement_month.split("-").map(Number);
      const prevM=m===1?12:m-1;
      const prevY=m===1?y-1:y;
      const prevMonthStr=`${prevY}-${String(prevM).padStart(2,"0")}`;
      const {data:prevStmts}=await db.from("statements").filter("card_id",stmt.card_id);
      const prev=(prevStmts||[]).find(s=>s.statement_month===prevMonthStr);
      setPrevStmtData(prev||null);
    }
    const [p,cats,tById,allSp,tAll]=await Promise.all([
      db.from("people").select(),
      db.from("spend_categories").select(),
      db.from("spend_transactions").filter("statement_id",stmt.id),
      db.from("transaction_splits").select(),
      db.from("spend_transactions").select(),
    ]);
    // Merge: by statement_id + by card+month (for untagged/legacy imports)
    const byId=new Set((tById.data||[]).map(t=>t.id));
    const byMonth=stmt.card_id&&stmt.statement_month
      ?(allSp.data||[]).filter(()=>false) // placeholder
      :[];
    // Actually filter allTxns for this card+month
    const byMonthTxns=(tAll.data||[]).filter(t=>
      t.statement_month===stmt.statement_month &&
      t.card_id===stmt.card_id &&
      !byId.has(t.id)
    );
    const merged=[...(tById.data||[]),...byMonthTxns];
    setPeople(p.data||[]);
    setCategories((cats.data||[]).map(x=>x.name).sort());
    setTxns(merged.sort((a,b)=>new Date(b.txn_date)-new Date(a.txn_date)));
    const map={};
    (allSp.data||[]).forEach(s=>{if(!map[s.transaction_id])map[s.transaction_id]=[];map[s.transaction_id].push(s);});
    setTxnSplitsMap(map);
  },[db,stmt.id]);
  useEffect(()=>{loadData();},[loadData]);

  const filtered=txns.filter(t=>!search||t.description?.toLowerCase().includes(search.toLowerCase())||t.category?.toLowerCase().includes(search.toLowerCase()));
  const sorted=[...filtered].sort((a,b)=>{
    let v=0;
    if(sortBy==="date") v=new Date(a.txn_date)-new Date(b.txn_date);
    else if(sortBy==="amount") v=Number(a.amount||0)-Number(b.amount||0);
    else if(sortBy==="category") v=(a.category||"").localeCompare(b.category||"");
    else if(sortBy==="desc") v=(a.description||"").localeCompare(b.description||"");
    return sortDir==="desc"?-v:v;
  });
  const totalPages=Math.ceil(sorted.length/PAGE);
  const pageTxns2=sorted.slice(page*PAGE,(page+1)*PAGE);
  const total=txns.reduce((a,t)=>a+Number(t.amount||0),0);

  const toggleSort=col=>{if(sortBy===col)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortBy(col);setSortDir("desc");}};
  const sortHdr=(col,label,align)=>(
    <th onClick={()=>toggleSort(col)} style={{padding:"6px 8px",textAlign:align||"left",cursor:"pointer",userSelect:"none",fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:sortBy===col?acc:mut,position:"relative",background:surf,whiteSpace:"nowrap"}}>
      {label}{sortBy===col?(sortDir==="desc"?" ↓":" ↑"):""}
    </th>
  );

  const resizeHandle=(ci)=>(
    <span onMouseDown={e=>{e.preventDefault();const sx=e.clientX;const sw=colW[ci];const mv=mv=>{setColW(w=>{const n=[...w];n[ci]=Math.max(ci===1?80:40,sw+(mv.clientX-sx));return n;});};const up=()=>{document.removeEventListener("mousemove",mv);document.removeEventListener("mouseup",up);};document.addEventListener("mousemove",mv);document.addEventListener("mouseup",up);}}
      style={{position:"absolute",right:0,top:"15%",bottom:"15%",width:3,cursor:"col-resize",background:acc+"66",borderRadius:2}}
      onMouseEnter={e=>e.currentTarget.style.background=acc}
      onMouseLeave={e=>e.currentTarget.style.background=acc+"66"}/>
  );

  const saveEdit=async()=>{
    const oldCat=txns.find(t=>t.id===editId)?.category;
    await db.from("spend_transactions").update(editId,{category:editRow.category,description:editRow.description});
    setEditId(null);
    // Offer to create rule if category changed
    if(oldCat&&oldCat!==editRow.category){
      const word=editRow.description?.split(" ")[0]?.toLowerCase();
      if(word&&word.length>2) setShowCreateRule({keyword:word,category:editRow.category});
    }
    await loadData();
    onSave&&onSave();
  };

  const reapplyRules=async()=>{
    setReapplying(true);
    // Load all rules (DB + defaults)
    const [{data:dbRules},{data:dbCats}]=await Promise.all([
      db.from("merchant_rules").select(),
      db.from("spend_categories").select(),
    ]);
    const allRules=[...(dbRules||[]),...DEFAULT_RULES];
    let updated=0;
    for(const t of txns){
      const desc=(t.description||"").toLowerCase();
      const descNoSpace=desc.replace(/\s+/g,"");
      for(const r of allRules){
        const k=r.keyword.toLowerCase();
        const kNoSpace=k.replace(/\s+/g,"");
        if(desc.includes(k)||descNoSpace.includes(kNoSpace)){
          if(r.category!==t.category){
            await db.from("spend_transactions").update(t.id,{category:r.category});
            updated++;
          }
          break;
        }
      }
    }
    setReapplying(false);
    await loadData();
    if(updated>0) alert(`Updated ${updated} transaction${updated!==1?"s":""} to matching categories.`);
    else alert("All transactions already match their rules.");
  };

  const bulkAssign=async()=>{
    if(!bulkCat||selected.size===0) return;
    for(const id of selected){
      await db.from("spend_transactions").update(id,{category:bulkCat});
    }
    setSelected(new Set()); setBulkCat("");
    await loadData(); onSave&&onSave();
  };

  const toggleSelect=id=>setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>setSelected(prev=>prev.size===pageTxns2.length?new Set():new Set(pageTxns2.map(t=>t.id)));

  const delTxn=async id=>{
    const {data:le}=await db.from("ledger_entries").filter("transaction_id",id);
    if((le||[]).length>0){
      const ans=confirm(`This transaction has ${le.length} ledger entr${le.length>1?"ies":"y"}. Delete them too?`);
      if(ans===null) return;
      if(ans) for(const e of le) await db.from("ledger_entries").delete(e.id);
    } else {
      if(!confirm("Delete this transaction?")) return;
    }
    const {data:sp}=await db.from("transaction_splits").filter("transaction_id",id);
    for(const s of (sp||[])) await db.from("transaction_splits").delete(s.id);
    await db.from("spend_transactions").delete(id);
    await loadData();
    onSave&&onSave();
  };

  const openSplit=t=>{
    setShowSplit(t);
    const existing=txnSplitsMap[t.id];
    if(existing&&existing.length>0) setSplits(existing.map(s=>({person_id:s.person_id||"",amount:Number(s.amount),is_personal:!!s.is_personal})));
    else setSplits([{person_id:"",amount:Number(t.amount),is_personal:true}]);
  };
  const addSplit=()=>setSplits(prev=>{
    const newSplits=[...prev,{person_id:"",amount:0,is_personal:false}];
    // Mine stays the same when adding a new 0-amount person
    return newSplits;
  });
  const updSplit=(i,k,v)=>setSplits(prev=>{
    const updated=prev.map((s,si)=>si===i?{...s,[k]:v}:s);
    // Auto-recalculate "Mine" = total - sum of others
    const othersTotal=updated.filter(s=>!s.is_personal).reduce((a,s)=>a+Number(s.amount||0),0);
    const total=Number(showSplit?.amount||0);
    // For credits (negative total), mine = total - others (can be negative)
    const myAmt=total<0?Math.min(0,total-othersTotal):Math.max(0,total-othersTotal);
    return updated.map(s=>s.is_personal?{...s,amount:myAmt}:s);
  });
  const splitTotal=splits.reduce((a,s)=>a+Number(s.amount||0),0);
  const splitRemaining=showSplit?(Number(showSplit.amount)-splitTotal):0;

  const saveSplit=async()=>{
    if(Math.abs(splitRemaining)>0.01) return alert("Splits must add up to "+inrFmt(Math.abs(Number(showSplit.amount))));
    const unassigned=splits.filter(s=>!s.is_personal&&!s.person_id);
    if(unassigned.length>0) return alert("Please select a person for each split row, or remove the empty rows.");
    // Delete old splits + ledger entries, then recreate fresh
    const {data:oldSplits}=await db.from("transaction_splits").filter("transaction_id",showSplit.id);
    for(const s of (oldSplits||[])) await db.from("transaction_splits").delete(s.id);
    const {data:oldLedger}=await db.from("ledger_entries").filter("transaction_id",showSplit.id);
    for(const e of (oldLedger||[])) await db.from("ledger_entries").delete(e.id);
    for(const s of splits){
      if(Number(s.amount)===0) continue;
      await db.from("transaction_splits").insert({transaction_id:showSplit.id,person_id:s.is_personal?null:(s.person_id||null),amount:Number(s.amount),is_personal:s.is_personal});
      if(!s.is_personal&&s.person_id){
        await db.from("ledger_entries").insert({person_id:s.person_id,amount:Math.abs(Number(s.amount)),direction:Number(s.amount)<0?"i_owe":"owed_to_me",description:showSplit.description||"CC transaction",entry_date:showSplit.txn_date,entry_type:"transaction",transaction_id:showSplit.id});
      }
    }
    const hasReimb=splits.some(s=>!s.is_personal&&s.person_id);
    await db.from("spend_transactions").update(showSplit.id,{is_reimbursable:hasReimb});
    setShowSplit(null);
    await loadData();
    onSave&&onSave();
  };

  // Mini dashboard stats
  const totalSpends=txns.filter(t=>Number(t.amount||0)>0).reduce((a,t)=>a+Number(t.amount),0);
  const totalCredits=txns.filter(t=>Number(t.amount||0)<0).reduce((a,t)=>a+Math.abs(Number(t.amount)),0);
  const myShare=txns.filter(t=>Number(t.amount||0)>0).reduce((a,t)=>{
    const sp=txnSplitsMap[t.id];
    if(!sp||!sp.length) return a+Number(t.amount); // unsplit = 100% mine
    const mine=sp.find(s=>s.is_personal);
    return a+Number(mine?.amount||0);
  },0);
  const othersShare=totalSpends-myShare;
  // Pie chart only on debit transactions, by category
  const catTotals={};
  txns.filter(t=>Number(t.amount||0)>0).forEach(t=>{catTotals[t.category||"Other"]=(catTotals[t.category||"Other"]||0)+Number(t.amount||0);});
  const topCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const PIE_COLORS=["#b07d3a","#2d6a4f","#9b2335","#7c6fcd","#2980b9"];
  let angle=0;
  const pieSlices=topCats.length>0?topCats.map(([cat,val],i)=>{
    const pct=val/totalSpends; const a1=angle; const a2=angle+pct*2*Math.PI; angle=a2;
    const cx=50,cy=50,r=42;
    const x1=cx+r*Math.sin(a1),y1=cy-r*Math.cos(a1);
    const x2=cx+r*Math.sin(a2),y2=cy-r*Math.cos(a2);
    return{cat,val,pct,color:PIE_COLORS[i],d:`M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${pct>0.5?1:0},1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`};
  }):[];

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <button onClick={onBack} style={{...gbtn,fontSize:12}}>← Back</button>
        <div style={{flex:1}}>
          <div style={{fontSize:20,fontWeight:700,color:txt,letterSpacing:"-0.03em"}}>{fmtMonth(stmt.statement_month)}</div>
          <div style={{fontSize:12,color:mut,marginTop:2}}>{txns.length} transactions</div>
        </div>
      </div>

      {/* Billing equation */}
      {(()=>{
        const prevStmt=prevStmtData;
        const hasPrev=!!prevStmt;
        const prevDue=prevStmt?.total_due||0;
        const thisDue=stmt.total_due||0;
        const EQ=[
          {label:"Prev Stmt Due",value:hasPrev?prevDue:null,missing:!hasPrev,color:txt},
          {op:"−"},
          {label:"Payments / Credits",value:totalCredits,color:grn},
          {op:"+"},
          {label:"Total Spends",value:totalSpends,color:txt},
          {op:"="},
          {label:"Total Amount Due",value:thisDue||null,missing:!thisDue,color:thisDue>0?red:mut,highlight:true},
        ];
        return(
          <Card style={{marginBottom:16,padding:"14px 16px"}}>
            <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12}}>Billing Equation</div>
            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:4}}>
              {EQ.map((e,i)=>e.op?(
                <div key={i} style={{fontSize:18,fontWeight:300,color:mut,padding:"0 4px"}}>{e.op}</div>
              ):(
                <div key={i} style={{padding:"8px 14px",borderRadius:10,background:e.highlight?acc+"12":surf2,border:`1px solid ${e.highlight?acc+"44":bdr}`,minWidth:100,textAlign:"center"}}>
                  <div style={{fontSize:9,color:mut,fontWeight:500,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4,whiteSpace:"nowrap"}}>{e.label}</div>
                  {e.missing?(
                    <div style={{fontSize:10,color:mut,fontStyle:"italic"}}>Stmt missing</div>
                  ):(
                    <div style={{fontSize:15,fontWeight:700,color:e.color,fontFamily:"'Manrope',sans-serif"}}>
                      {e.value!=null?"₹"+e.value.toLocaleString("en-IN"):"—"}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!stmt.total_due&&<div style={{fontSize:11,color:mut,marginTop:10}}>Total Amount Due not set — re-import this statement or update it via Edit.</div>}
          </Card>
        );
      })()}

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        {[
          {label:"Total Spends",value:totalSpends},
          {label:"Total Credits",value:totalCredits,color:grn},
          {label:"My Share",value:myShare},
          {label:"Others' Share",value:othersShare,color:othersShare>0?acc:mut},
        ].map((s,i)=>(
          <Card key={i} style={{padding:"12px 14px"}}>
            <div style={{fontSize:9,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:4,fontWeight:500}}>{s.label}</div>
            <div style={{fontSize:17,fontWeight:700,color:s.color||txt,fontFamily:"'Manrope',sans-serif"}}>₹{(s.value||0).toLocaleString("en-IN",{maximumFractionDigits:0})}</div>
          </Card>
        ))}
      </div>
      {/* Reconciliation check */}
      {(()=>{
        const calcDue=prevStmtData?(prevStmtData.total_due||0)-totalCredits+totalSpends:null;
        const stmtDue=stmt.total_due||0;
        const diff=calcDue!=null&&stmtDue?Math.abs(calcDue-stmtDue):null;
        const matched=diff!=null&&diff<1;
        if(!stmtDue&&!prevStmtData) return null;
        return(
          <Card style={{marginBottom:16,padding:"14px 16px",borderLeft:`3px solid ${matched?grn:diff!=null?amber:bdr}`}}>
            <div style={{fontSize:9,fontWeight:500,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>Reconciliation Check</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div>
                <div style={{fontSize:10,color:mut,marginBottom:3}}>Calculated Due</div>
                <div style={{fontSize:15,fontWeight:700,color:txt}}>
                  {calcDue!=null?`₹${calcDue.toLocaleString("en-IN",{maximumFractionDigits:0})}`:"—"}
                </div>
                {!prevStmtData&&<div style={{fontSize:10,color:mut,marginTop:2}}>Prev stmt missing</div>}
              </div>
              <div>
                <div style={{fontSize:10,color:mut,marginBottom:3}}>Statement Due (from bill)</div>
                <div style={{fontSize:15,fontWeight:700,color:txt}}>
                  {stmtDue?`₹${stmtDue.toLocaleString("en-IN")}` :"Not set"}
                </div>
              </div>
              <div>
                <div style={{fontSize:10,color:mut,marginBottom:3}}>Status</div>
                {!stmtDue||calcDue==null?(
                  <div style={{fontSize:12,color:mut}}>Insufficient data</div>
                ):matched?(
                  <div style={{fontSize:13,fontWeight:600,color:grn}}>✓ Match</div>
                ):(
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:amber}}>⚠ Difference</div>
                    <div style={{fontSize:11,color:mut,marginTop:2}}>₹{diff.toLocaleString("en-IN",{maximumFractionDigits:0})} off — check for missing or misassigned transactions</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Pie chart below stats */}
      {pieSlices.length>0&&<Card style={{marginBottom:16}}>
        <div style={{fontSize:9,color:mut,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:12,fontWeight:500}}>Spend by Category (debits only)</div>
        <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
          <svg width="120" height="120" viewBox="0 0 100 100" style={{flexShrink:0}}>
            {pieSlices.map((s,i)=><path key={i} d={s.d} fill={s.color} stroke={surf} strokeWidth="1"/>)}
          </svg>
          <div style={{flex:1,minWidth:180}}>
            {topCats.map(([cat,val],i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:2,background:PIE_COLORS[i],flexShrink:0}}/>
                  <span style={{fontSize:12,color:txt}}>{cat}</span>
                </div>
                <span style={{fontSize:12,fontWeight:500,color:txt,marginLeft:12}}>₹{val.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>}

      {/* Toolbar */}
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        <button style={{...gbtn,fontSize:12,display:"flex",alignItems:"center",gap:6,opacity:reapplying?0.6:1}} onClick={reapplyRules} disabled={reapplying}>
          {reapplying?"⟳ Applying…":"⟳ Re-apply rules"}
        </button>
        {selected.size>0&&<>
          <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={bulkCat} onChange={e=>setBulkCat(e.target.value)}>
            <option value="">Set category for {selected.size} selected…</option>
            {categories.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button style={{...pbtn,fontSize:12}} onClick={bulkAssign}>Apply</button>
          <button style={{...gbtn,fontSize:12}} onClick={()=>setSelected(new Set())}>Clear</button>
        </>}
      </div>
      {/* Search + sort */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <input style={{...inp,marginBottom:0,flex:1,minWidth:160,fontSize:12}} placeholder="Search transactions…" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/>
        <select style={{...inp,marginBottom:0,fontSize:12,width:"auto"}} value={sortBy+"-"+sortDir} onChange={e=>{const[s,d]=e.target.value.split("-");setSortBy(s);setSortDir(d);}}>
          <option value="date-desc">Date (newest)</option>
          <option value="date-asc">Date (oldest)</option>
          <option value="amount-desc">Amount ↓</option>
          <option value="amount-asc">Amount ↑</option>
          <option value="category-asc">Category A-Z</option>
        </select>
      </div>

      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,tableLayout:"fixed"}}>
          <colgroup>{colW.map((w,i)=><col key={i} style={{width:w,minWidth:i===1?80:40}}/>)}</colgroup>
          <thead>
            <tr style={{borderBottom:`2px solid ${bdr}`}}>
              <th style={{padding:"6px 8px",background:surf,width:32}}>
                <input type="checkbox" checked={selected.size===pageTxns2.length&&pageTxns2.length>0} onChange={toggleAll} style={{accentColor:acc,cursor:"pointer"}}/>
              </th>
              {[["date","Date"],["desc","Description"],["category","Category"],["amount","Amount"]].map(([col,label],ci)=>(
                <th key={ci} onClick={()=>toggleSort(col)} style={{padding:"6px 8px",textAlign:ci===3?"right":"left",cursor:"pointer",userSelect:"none",fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:sortBy===col?acc:mut,position:"relative",background:surf}}>
                  {label}{sortBy===col?(sortDir==="desc"?" ↓":" ↑"):""}
                  {resizeHandle(ci)}
                </th>
              ))}
              <th style={{padding:"6px 8px",fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:mut,position:"relative",background:surf}}>Split{resizeHandle(4)}</th>
              <th style={{padding:"6px 8px",fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:mut,position:"relative",background:surf}}>Edit{resizeHandle(5)}</th>
            </tr>
          </thead>
          <tbody>
            {pageTxns2.map(t=>(
              <tr key={t.id} style={{borderBottom:`1px solid ${bdr}`,background:selected.has(t.id)?acc+"10":t.is_reimbursable?acc+"06":surf}}>
                <td style={{padding:"7px 8px",textAlign:"center"}}>
                  <input type="checkbox" checked={selected.has(t.id)} onChange={()=>toggleSelect(t.id)} style={{accentColor:acc,cursor:"pointer"}}/>
                </td>
                <td style={{padding:"7px 8px",color:mut,wordBreak:"break-word"}}>{fmtDate(t.txn_date)}</td>
                <td style={{padding:"7px 8px",color:txt,wordBreak:"break-word"}}>
                  {editId===t.id?<input style={{...inp,marginBottom:0,width:"100%",fontSize:11}} value={editRow.description} onChange={e=>setEditRow(r=>({...r,description:e.target.value}))}/>:t.description}
                </td>
                <td style={{padding:"7px 8px",wordBreak:"break-word"}}>
                  {editId===t.id?
                    <select style={{fontSize:11,border:`1px solid ${bdr}`,borderRadius:6,padding:"3px 6px",background:surf,color:txt,outline:"none",width:"100%"}} value={editRow.category} onChange={e=>setEditRow(r=>({...r,category:e.target.value}))}>
                      {categories.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>:
                    <span style={{background:surf2,padding:"2px 7px",borderRadius:10,fontSize:10,color:mut}}>{t.category}</span>
                  }
                </td>
                <td style={{padding:"7px 8px",textAlign:"right",fontWeight:600,color:txt}}>₹{Number(t.amount||0).toLocaleString("en-IN")}</td>
                <td style={{padding:"7px 8px",minWidth:80}}>
                  {t.is_reimbursable&&txnSplitsMap[t.id]&&txnSplitsMap[t.id].length>0?(
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {txnSplitsMap[t.id].map((sp,si)=>{
                        const pName=sp.is_personal?"Me":people.find(p=>p.id===sp.person_id)?.name||"?";
                        return<span key={si} style={{fontSize:10,background:acc+"12",borderRadius:6,padding:"1px 6px",color:acc,fontWeight:500,whiteSpace:"nowrap"}}>{pName} ₹{Number(sp.amount).toLocaleString("en-IN")}</span>;
                      })}
                      <button onClick={()=>openSplit(t)} style={{fontSize:10,color:mut,background:"none",border:"none",cursor:"pointer",padding:"1px 0",textAlign:"left",fontFamily:"'Manrope',sans-serif"}}>✏ edit</button>
                    </div>
                  ):(
                    <button onClick={()=>openSplit(t)} style={{background:"none",border:`1px solid ${bdr}`,borderRadius:6,cursor:"pointer",fontSize:11,padding:"2px 8px",color:mut,fontFamily:"'Manrope',sans-serif"}}>+ Split</button>
                  )}
                </td>
                <td style={{padding:"7px 8px",textAlign:"center"}}>
                  {editId===t.id?(
                    <div style={{display:"flex",gap:3,justifyContent:"center"}}>
                      <button style={{...gbtn,padding:"2px 7px",fontSize:10}} onClick={saveEdit}>Save</button>
                      <button style={{...gbtn,padding:"2px 7px",fontSize:10}} onClick={()=>setEditId(null)}>×</button>
                    </div>
                  ):(
                    <div style={{display:"flex",gap:3,justifyContent:"center"}}>
                      <button style={{...gbtn,padding:"2px 7px",fontSize:10}} onClick={()=>{setEditId(t.id);setEditRow({...t});}}>Edit</button>
                      <button style={{...dbtn,padding:"2px 7px",fontSize:10}} onClick={()=>delTxn(t.id)}>Del</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages>1&&<div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:12,fontSize:12,color:mut}}>
        <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{...gbtn,padding:"4px 12px",opacity:page===0?0.4:1}}>← Prev</button>
        <span>{page*PAGE+1}–{Math.min((page+1)*PAGE,sorted.length)} of {sorted.length}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} style={{...gbtn,padding:"4px 12px",opacity:page===totalPages-1?0.4:1}}>Next →</button>
      </div>}

      {/* Create Rule Modal */}
      <Modal show={!!showCreateRule} onClose={()=>setShowCreateRule(null)} title="Save as Auto-Rule?">
        {showCreateRule&&<>
          <div style={{fontSize:13,color:mut,marginBottom:16,lineHeight:1.6}}>
            Create a rule: if a transaction description contains <strong style={{color:txt}}>"{showCreateRule.keyword}"</strong>, automatically set category to <strong style={{color:txt}}>{showCreateRule.category}</strong>.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div>
              {lbl("Keyword")}
              <input style={inp} value={showCreateRule.keyword} onChange={e=>setShowCreateRule(r=>({...r,keyword:e.target.value}))}/>
            </div>
            <div>
              {lbl("Category")}
              <select style={inp} value={showCreateRule.category} onChange={e=>setShowCreateRule(r=>({...r,category:e.target.value}))}>
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{...gbtn,flex:1,justifyContent:"center"}} onClick={()=>setShowCreateRule(null)}>Skip</button>
            <button style={{...pbtn,flex:1,justifyContent:"center"}} onClick={async()=>{
              await db.from("merchant_rules").insert({keyword:showCreateRule.keyword.toLowerCase(),category:showCreateRule.category});
              setShowCreateRule(null);
            }}>Save Rule</button>
          </div>
        </>}
      </Modal>

      {/* Split Modal */}
      <Modal show={!!showSplit} onClose={()=>setShowSplit(null)} title="Split Transaction">
        {showSplit&&<>
          <div style={{fontSize:14,fontWeight:700,color:txt,marginBottom:2}}>{showSplit.description}</div>
          <div style={{fontSize:12,color:mut,marginBottom:16}}>Total: <strong style={{color:txt}}>₹{Number(showSplit.amount).toLocaleString("en-IN")}</strong></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
            {splits.map((s,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:10,alignItems:"center",padding:"12px 14px",background:s.is_personal?grn+"08":surf2,borderRadius:12,border:`1px solid ${s.is_personal?grn+"30":bdr}`}}>
                <div>
                  {s.is_personal?(
                    <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:"50%",background:grn}}/><span style={{fontSize:13,fontWeight:600,color:txt}}>Mine (auto)</span></div>
                  ):(
                    <select style={{width:"100%",fontSize:13,border:"none",background:"transparent",color:txt,fontFamily:"'Manrope',sans-serif",fontWeight:500,outline:"none",cursor:"pointer"}} value={s.person_id} onChange={e=>updSplit(i,"person_id",e.target.value)}>
                      <option value="">Select person…</option>
                      {people.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  )}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4,background:s.is_personal?grn+"10":surf,borderRadius:8,padding:"4px 10px",border:`1px solid ${s.is_personal?grn+"40":bdr}`}}>
                  <span style={{fontSize:12,color:mut,fontWeight:500}}>₹</span>
                  {s.is_personal?(
                    <span style={{width:80,fontSize:13,fontWeight:700,color:grn,textAlign:"right",display:"inline-block"}}>{Number(s.amount||0).toLocaleString("en-IN")}</span>
                  ):(
                    <input type="text" inputMode="decimal" style={{border:"none",background:"transparent",width:80,fontSize:13,fontWeight:600,color:txt,fontFamily:"'Manrope',sans-serif",outline:"none",textAlign:"right"}} value={s.amount} onChange={e=>updSplit(i,"amount",e.target.value)}/>
                  )}
                </div>
                {!s.is_personal?<button onClick={()=>setSplits(prev=>{
                        const filtered=prev.filter((_,si)=>si!==i);
                        const othersTotal=filtered.filter(s=>!s.is_personal).reduce((a,s)=>a+Number(s.amount||0),0);
                        const tot=Number(showSplit?.amount||0);
                        const myAmt=tot<0?Math.min(0,tot-othersTotal):Math.max(0,tot-othersTotal);
                        return filtered.map(s=>s.is_personal?{...s,amount:myAmt}:s);
                      })} style={{background:red+"12",border:"none",cursor:"pointer",color:red,width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700}}>×</button>:<div style={{width:28}}/>}
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"10px 14px",background:Math.abs(splitRemaining)<0.01?grn+"10":red+"08",borderRadius:10,border:`1px solid ${Math.abs(splitRemaining)<0.01?grn+"30":red+"30"}`}}>
            <button style={{fontSize:12,fontWeight:600,color:acc,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"'Manrope',sans-serif"}} onClick={addSplit}>+ Add person</button>
            <div style={{fontSize:12,fontWeight:700,color:Math.abs(splitRemaining)<0.01?grn:red}}>
              {Math.abs(splitRemaining)<0.01?"✓ Balanced":splitRemaining>0?`-₹${splitRemaining.toLocaleString("en-IN")} unallocated`:`+₹${Math.abs(splitRemaining).toLocaleString("en-IN")} over`}
            </div>
          </div>
          <button style={{...pbtn,width:"100%",justifyContent:"center",opacity:Math.abs(splitRemaining)<0.01?1:0.5}} onClick={saveSplit}>Save Split</button>
        </>}
      </Modal>
    </div>
  );
}
