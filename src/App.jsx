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
