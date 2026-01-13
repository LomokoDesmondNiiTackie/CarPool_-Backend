### Project Backend – Ride Booking & Bus Assignment System
Overview

This repository contains the backend service for a smart ride-booking and bus assignment platform designed for structured commuter transport.

The system supports user registration, route-based bus assignment, wallet-based payments, QR code ride verification, admin management, and real-time operational logic, with scalability in mind.

## Core Objectives

Efficient ride booking with single-ride per booking

Fast and deterministic bus assignment

Secure QR-based ride confirmation

Wallet-based payments (MTN MoMo, future Cardano support)

Admin control for buses, bookings, and issues

Scalable architecture for future real-time features

## Key Features
# Rider Features

    User registration with location & route selection

    Ride booking (no seat selection at booking time)

    Wallet balance management

    QR code generation for ride confirmation

    Booking notifications & ride details

# Driver Features

    Assigned fixed routes & bus stops

    QR scanning to validate rider eligibility

    Real-time ride confirmation via backend

# Admin Features

    Bus & route management

    Manual ride reassignment (fallback)

    Booking overview & reports

    Refund handling (policy-based)

    Issue management & monitoring

# Backend Architecture

    API Style: REST (GraphQL planned for later phases)

    Architecture: Modular / Domain-driven

    Concurrency Handling: DB transactions & atomic operations

    Communication: Event-driven (EventEmitter)

    Authentication: JWT-based

    Security: Input validation, rate limiting, RBAC

# Tech Stack

    Runtime: Node.js (TypeScript)

    Framework: Express.js

    Database: PostgreSQL (via Prisma ORM)

    Authentication: JWT

    Validation: Zod

    Payments: MTN MoMo API

    QR Codes: QR generation & scanning

    Logging: Pino

    Security: Helmet, CORS, Rate Limiting

    Testing: Jest, Supertest

## Project Structure
    src/
    ├─ modules/
    │   ├─ auth/            # Authentication & authorization
    │   ├─ users/           # User profiles & roles
    │   ├─ bookings/        # Ride booking logic
    │   ├─ buses/           # Bus & capacity management
    │   ├─ routes/          # Routes & bus stops
    │   ├─ assignment/      # Bus assignment algorithms
    │   ├─ payments/        # Wallet & payment processing
    │   ├─ qr/              # QR generation & verification
    │   ├─ notifications/   # Email / SMS notifications
    │   └─ admin/           # Admin operations & dashboards
    │
    ├─ shared/
    │   ├─ db/              # Prisma client & DB helpers
    │   ├─ middleware/      # Auth, validation, error handling
    │   ├─ utils/           # Common helpers
    │   └─ events/          # Event-driven logic
    │
    └─ server.ts            # App bootstrap

## Booking & Ride Flow (Simplified)

    User registers and selects route & bus stop

    User loads wallet and books a ride

    Backend assigns bus based on route capacity

    QR code is generated for the booking

    Driver scans QR code (online verification)

    Backend confirms ride eligibility

    Ride is marked as active / completed

## Payment Strategy

    Wallet-based payments (MTN MoMo)

    No seat reservation before scan

    No refund if seat is missed (policy enforced)

    Future support for Cardano-based payments


## Setup & Development
    npm install
    npx prisma generate
    npm run dev
