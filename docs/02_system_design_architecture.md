# FitCrowd – Smart Fitness Center Visit Planner
# System Design & Architectural Specification

**Document Version:** 1.0.0  
**Prepared For:** Academic Evaluation & Capstone Review  
**Course:** Software Engineering & System Design (SESD)  
**Author:** Senior Software Engineer & System Architect (Mentor) & CSE Student (Mentee)  
**Status:** Approved Architectural Baseline  
**Date:** November 2026  

---

## 1. High-Level System Architecture

FitCrowd is architected as a **Modular Layered Architecture (Client-Server)** with clean domain boundaries, designed to operate as a high-cohesion modular monolith for frictionless single-command local demonstration while providing a seamless evolutionary pathway toward microservices.

```mermaid
flowchart TB
    subgraph ClientLayer["Presentation Tier (Frontend - React + Vite)"]
        UI_Member["Member Web App<br/>(Mobile-First Responsive)"]
        UI_Admin["Admin Analytics Dashboard<br/>(Charts & Capacity Controls)"]
        UI_Sim["Live Demo Simulator Panel<br/>(Surge & Check-In Simulation)"]
    end

    subgraph APILayer["Application Tier (Node.js + Express)"]
        Router["Express Router & Dispatcher"]
        MW_Auth["JWT & RBAC Middleware"]
        MW_Val["Input Sanitizer & Validator"]

        subgraph Controllers["Controllers Layer"]
            C_Auth["AuthController"]
            C_Crowd["CrowdController"]
            C_Booking["BookingController"]
            C_Admin["AdminController"]
        end

        subgraph Services["Domain Service Layer (Business Logic)"]
            S_Auth["AuthService"]
            S_Occupancy["OccupancyService"]
            S_Booking["BookingService<br/>(ACID Transactions)"]
            S_Recommend["RecommendationService"]
            S_Prediction["Prediction Context<br/>(Strategy Pattern)"]
        end

        subgraph Strategies["Prediction Strategies"]
            Strat_TB["TimeBucketMovingAvgStrategy"]
            Strat_ML["RegressionStrategy<br/>(Linear / Ridge / Poly)"]
        end

        subgraph Repositories["Repository Tier (Data Access Object)"]
            R_User["UserRepository"]
            R_Occupancy["OccupancyRepository"]
            R_Booking["BookingRepository"]
            R_Visit["VisitHistoryRepository"]
        end
    end

    subgraph DataLayer["Persistence Tier"]
        DB[(SQLite WAL Mode / PostgreSQL)]
    end

    subgraph ExtLayer["Optional ML Microservice (FastAPI)"]
        PyML["Python Scikit-Learn Service<br/>(Port 8000)"]
    end

    %% Client to API
    UI_Member -->|HTTPS / REST API| Router
    UI_Admin -->|HTTPS / REST API| Router
    UI_Sim -->|HTTPS / REST API| Router

    %% Router through Middlewares to Controllers
    Router --> MW_Auth --> MW_Val
    MW_Val --> C_Auth
    MW_Val --> C_Crowd
    MW_Val --> C_Booking
    MW_Val --> C_Admin

    %% Controllers to Services
    C_Auth --> S_Auth
    C_Crowd --> S_Occupancy
    C_Crowd --> S_Prediction
    C_Crowd --> S_Recommend
    C_Booking --> S_Booking
    C_Admin --> S_Occupancy

    %% Prediction Strategy Binding
    S_Prediction --> Strat_TB
    S_Prediction --> Strat_ML
    Strat_ML -.->|Optional HTTP RPC| PyML

    %% Services to Repositories
    S_Auth --> R_User
    S_Occupancy --> R_Occupancy
    S_Occupancy --> R_Visit
    S_Booking --> R_Booking
    S_Booking --> R_Occupancy
    S_Recommend --> R_Visit
    Strat_TB --> R_Visit

    %% Repositories to DB
    R_User --> DB
    R_Occupancy --> DB
    R_Booking --> DB
    R_Visit --> DB
```

---

## 2. Architectural Style Justification & Microservices Evolution

### 2.1 Why Layered Modular Monolith for the MVP?
1. **Zero Deployment Friction:** For academic examination and local demonstrations, a student cannot afford orchestration failures, distributed network partitions, or port collision headaches. A layered monolith runs in a single process with zero configuration.
2. **ACID Transaction Guarantees:** Preventing double booking requires transactional atomicity (`BEGIN IMMEDIATE`). In a distributed microservice setup, ensuring this across services requires complex Distributed Sagas or Two-Phase Commit (2PC), introducing unwarranted complexity and latency for a gym management platform.
3. **High Cohesion, Low Coupling:** By strictly enforcing the **Repository Pattern** and **Service Layer boundaries**, our code does not leak database queries into controllers.

### 2.2 Evolutionary Pathway to Microservices
As the fitness center franchise scales to 50+ branches with hundreds of thousands of daily check-ins, the application can naturally decompose along existing service boundaries:

```mermaid
flowchart LR
    GW["API Gateway<br/>(Reverse Proxy, Rate Limiting, TLS)"]
    S_AuthMS["Auth Service<br/>(JWT / OAuth2 / IAM)"]
    S_BookingMS["Slot & Booking Service<br/>(High Concurrency / Redis Cache)"]
    S_TelemetryMS["Occupancy & IoT Ingestion<br/>(Turnstile MQTT / Kafka Stream)"]
    S_AnalyticsMS["Prediction & ML Service<br/>(Batch Training / Model Inference)"]

    GW --> S_AuthMS
    GW --> S_BookingMS
    GW --> S_TelemetryMS
    GW --> S_AnalyticsMS
```

- **IoT Turnstile Ingestion Service:** Receives hardware RFID turnstile events over MQTT or WebSockets and streams them to an Apache Kafka or RabbitMQ event bus.
- **Booking Service:** Operates independently with an in-memory Redis cluster for atomic distributed locking (`Redlock`).
- **Prediction Worker:** Runs on GPU-accelerated Python nodes performing continuous offline retraining of XGBoost or LSTM recurrent neural network models.

---

## 3. Comprehensive UML Diagrams

### 3.1 Class Diagram (Design Patterns & Layered Separation)

```mermaid
classDiagram
    %% Entities
    class User {
        +int id
        +string email
        +string passwordHash
        +string fullName
        +string role
        +datetime createdAt
        +validatePassword(plainPassword) bool
    }

    class Slot {
        +int id
        +date slotDate
        +int startHour
        +int endHour
        +int maxCapacity
        +int currentBookings
        +isFull() bool
    }

    class Booking {
        +int id
        +int userId
        +int slotId
        +string status
        +datetime bookedAt
        +datetime cancelledAt
    }

    class VisitLog {
        +int id
        +int userId
        +datetime checkInTime
        +datetime checkOutTime
        +int durationMinutes
        +string checkInType
    }

    class GymConfig {
        +int id
        +int maxCapacity
        +string gymName
        +int openHour
        +int closeHour
    }

    %% Repositories
    class IBookingRepository {
        <<interface>>
        +findSlotById(slotId) Slot
        +findUserBooking(userId, slotId) Booking
        +createBookingAtomic(userId, slotId) Booking
        +cancelBookingAtomic(bookingId, userId) bool
    }

    class IOccupancyRepository {
        <<interface>>
        +getCurrentOccupancy() int
        +recordCheckIn(userId, type) VisitLog
        +recordCheckOut(userId) VisitLog
        +getHistoricalVisits(dayOfWeek, hour) List~VisitLog~
    }

    %% Strategies
    class IPredictionStrategy {
        <<interface>>
        +predictHourlyCrowd(dayOfWeek) Map~int, PredictedCrowd~
        +calculateMAE(actualData, predictedData) float
    }

    class TimeBucketMovingAvgStrategy {
        -int rollingWindowWeeks
        +predictHourlyCrowd(dayOfWeek) Map~int, PredictedCrowd~
        +calculateMAE(actualData, predictedData) float
    }

    class RegressionStrategy {
        -float[] weights
        +predictHourlyCrowd(dayOfWeek) Map~int, PredictedCrowd~
        +calculateMAE(actualData, predictedData) float
    }

    %% Services
    class BookingService {
        -IBookingRepository bookingRepo
        +bookSlot(userId, slotId) BookingResult
        +cancelBooking(userId, bookingId) bool
        +getUserUpcomingBookings(userId) List~Booking~
    }

    class PredictionService {
        -IPredictionStrategy strategy
        +setStrategy(IPredictionStrategy strategy)
        +getForecast(dayOfWeek) ForecastResult
        +getBestTime(dayOfWeek, startHour, endHour) Recommendation
    }

    %% Relations
    User "1" --> "*" Booking : reserves
    Slot "1" --> "*" Booking : contains
    User "1" --> "*" VisitLog : logs
    BookingService --> IBookingRepository : uses
    PredictionService --> IPredictionStrategy : delegates to
    IPredictionStrategy <|.. TimeBucketMovingAvgStrategy : implements
    IPredictionStrategy <|.. RegressionStrategy : implements
```

---

### 3.2 Sequence Diagrams

#### 3.2.1 Sequence Diagram: User Authentication & JWT Issuance

```mermaid
sequenceDiagram
    autonumber
    actor User as Member / Admin
    participant Client as React Frontend
    participant Route as Auth Route & Validator
    participant Service as AuthService
    participant Repo as UserRepository
    participant DB as SQLite / PostgreSQL

    User->>Client: Enters email and password, clicks "Log In"
    Client->>Route: POST /api/auth/login {email, password}
    Route->>Route: Validate payload (email format, non-empty)
    Route->>Service: authenticate(email, password)
    Service->>Repo: findByEmail(email)
    Repo->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Repo: User record (including bcrypt password_hash)
    Repo-->>Service: User entity
    alt User not found
        Service-->>Route: Throw AuthError("Invalid credentials")
        Route-->>Client: 401 Unauthorized
    else User exists
        Service->>Service: bcrypt.compare(password, password_hash)
        alt Password mismatch
            Service-->>Route: Throw AuthError("Invalid credentials")
            Route-->>Client: 401 Unauthorized
        else Password valid
            Service->>Service: jwt.sign({id, role, email}, secret, {expiresIn: '24h'})
            Service-->>Route: {token, user: {id, fullName, role}}
            Route-->>Client: 200 OK + JWT Token & User Data
            Client->>Client: Store JWT in localStorage / Memory Context
            Client-->>User: Navigate to Member / Admin Dashboard
        end
    end
```

---

#### 3.2.2 Sequence Diagram: Concurrency-Safe Slot Booking

This diagram demonstrates how FitCrowd resolves race conditions and guarantees zero overbooking using database-level atomic transactions.

```mermaid
sequenceDiagram
    autonumber
    actor User as Gym Member
    participant Client as React Frontend
    participant AuthMW as AuthMiddleware (JWT)
    participant Ctrl as BookingController
    participant Svc as BookingService
    participant Repo as BookingRepository
    participant DB as Database Engine (ACID)

    User->>Client: Selects 18:00 Slot & clicks "Book Slot"
    Client->>AuthMW: POST /api/bookings {slotId: 42} [Bearer Token]
    AuthMW->>AuthMW: Verify JWT token & extract userId
    AuthMW->>Ctrl: handleBookSlot(req, res)
    Ctrl->>Svc: reserveSlot(userId, slotId)
    
    rect rgb(240, 248, 255)
        note right of Svc: Atomic Transaction Boundary
        Svc->>Repo: executeTransaction()
        Repo->>DB: BEGIN IMMEDIATE / START TRANSACTION
        
        Repo->>DB: SELECT * FROM bookings WHERE user_id = ? AND slot_id = ? AND status = 'BOOKED'
        DB-->>Repo: No active booking found
        
        Repo->>DB: SELECT current_bookings, max_capacity FROM slots WHERE id = ?
        DB-->>Repo: {current_bookings: 19, max_capacity: 20}
        
        alt current_bookings >= max_capacity
            Repo->>DB: ROLLBACK
            Repo-->>Svc: Error: SLOT_FULL
            Svc-->>Ctrl: 409 Conflict ("Slot is at maximum capacity")
            Ctrl-->>Client: 409 Conflict
        else current_bookings < max_capacity
            Repo->>DB: INSERT INTO bookings (user_id, slot_id, status) VALUES (?, ?, 'BOOKED')
            Repo->>DB: UPDATE slots SET current_bookings = current_bookings + 1 WHERE id = ?
            Repo->>DB: COMMIT TRANSACTION
            DB-->>Repo: Transaction Committed Successfully
            Repo-->>Svc: Booking entity created (id: 108)
            Svc-->>Ctrl: Success response payload
            Ctrl-->>Client: 201 Created {bookingId: 108, status: 'BOOKED'}
            Client-->>User: Display green confirmation toast & update available seats
        end
    end
```

---

#### 3.2.3 Sequence Diagram: Real-Time Check-In and Check-Out Flow

```mermaid
sequenceDiagram
    autonumber
    actor Member as Member / Simulator
    participant Client as Frontend UI
    participant Ctrl as CrowdController
    participant Svc as OccupancyService
    participant Repo as OccupancyRepository
    participant DB as Database

    Member->>Client: Clicks "Check In"
    Client->>Ctrl: POST /api/crowd/check-in {userId: 15}
    Ctrl->>Svc: processCheckIn(userId)
    Svc->>Repo: recordCheckIn(userId)
    Repo->>DB: INSERT INTO visits (user_id, check_in_time) VALUES (?, datetime('now'))
    Repo->>DB: UPDATE gym_config SET current_occupancy = current_occupancy + 1
    DB-->>Repo: OK
    Repo-->>Svc: New current occupancy count = 46
    Svc->>Svc: Calculate status: 46 / 100 = 46% -> "LOW"
    Svc-->>Ctrl: {occupancy: 46, capacity: 100, level: 'LOW'}
    Ctrl-->>Client: 200 OK
    Client-->>Member: Live Gauge animates to 46% (Green)
```

---

#### 3.2.4 Sequence Diagram: "Best Time to Visit" Algorithmic Recommendation Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Member as Gym Member
    participant Client as Frontend UI
    participant Ctrl as CrowdController
    participant RecSvc as RecommendationService
    participant PredSvc as PredictionService
    participant Strategy as TimeBucketStrategy
    participant Repo as VisitHistoryRepository

    Member->>Client: Requests best time: Tuesday between 16:00 and 20:00
    Client->>Ctrl: GET /api/crowd/recommend?dayOfWeek=2&start=16&end=20
    Ctrl->>RecSvc: getBestWindow(dayOfWeek=2, startHour=16, endHour=20)
    RecSvc->>PredSvc: getPredictionsForRange(2, [16, 17, 18, 19, 20])
    PredSvc->>Strategy: computeHourlyCrowds(2)
    Strategy->>Repo: getHistoricalAggregates(dayOfWeek=2)
    Repo-->>Strategy: Rolling averages: {16: 42, 17: 68, 18: 85, 19: 72, 20: 38}
    Strategy-->>PredSvc: Forecast array with density percentages
    PredSvc-->>RecSvc: Window data: [ {hour: 16, occ: 42%}, {hour: 17, occ: 68%}, ..., {hour: 20, occ: 38%} ]
    RecSvc->>RecSvc: Filter within [16, 20] & sort ascending by expected occupancy
    Note over RecSvc: Minimum detected at Hour 20 (38% occupancy - LOW)
    RecSvc-->>Ctrl: { recommendedHour: 20, crowdLevel: "LOW", expectedOccupancy: 38, windowRankings: [...] }
    Ctrl-->>Client: 200 OK
    Client-->>Member: Displays Recommendation Card: "Best Time: 8:00 PM (38% expected crowd)"
```

---

### 3.3 Activity Diagram: Member Workout Planning Lifecycle

```mermaid
flowchart TD
    Start([Member Opens FitCrowd App]) --> ViewLive[Check Real-Time Crowd Gauge]
    ViewLive --> DecideImmediate{Visit Right Now?}
    
    DecideImmediate -- Yes --> CheckCapacity{Current Crowd < 85%?}
    CheckCapacity -- Yes --> VisitGym[Travel to Gym]
    CheckCapacity -- No --> WaitWarning[High Rush Alert: Consider Scheduling Later]
    WaitWarning --> EnterWindow
    
    DecideImmediate -- No --> EnterWindow[Enter Preferred Workout Window<br/>e.g., 5:00 PM - 8:00 PM]
    EnterWindow --> CallRec[Request Smart Best Time Recommendation]
    CallRec --> ReviewOptions[Review Hourly Predicted Crowd Chart]
    ReviewOptions --> SelectSlot[Select Recommended Low-Crowd Slot]
    SelectSlot --> ClickBook[Submit Slot Reservation]
    
    ClickBook --> AtomicTxn{Is Slot Capacity Available?}
    AtomicTxn -- No --> SlotFullNotice[Display 'Slot Full' Alert & Suggest 2nd Best Slot]
    SlotFullNotice --> SelectSlot
    
    AtomicTxn -- Yes --> ConfirmBooking[Booking Confirmed with Status 'BOOKED']
    ConfirmBooking --> ArriveGym[Arrive at Gym during Booked Slot]
    ArriveGym --> CheckInAction[Check In via App / Counter]
    CheckInAction --> Workout[Perform Workout Session]
    Workout --> CheckOutAction[Check Out via App / Counter]
    CheckOutAction --> UpdateHistory[Log Completed Visit to Personal History]
    UpdateHistory --> End([End Workflow])
```

---

### 3.4 State Machine Diagram: Booking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> AVAILABLE : Slot Generated by Admin/System

    AVAILABLE --> RESERVED : Member submits reservation (Atomic Txn)
    RESERVED --> AVAILABLE : Member cancels reservation before start
    RESERVED --> CHECKED_IN : Member checks in during slot window
    RESERVED --> NO_SHOW : Slot window expires without check-in

    CHECKED_IN --> COMPLETED : Member checks out / Session auto-closes
    
    AVAILABLE --> FULL : Remaining Capacity drops to 0
    FULL --> AVAILABLE : A member cancels reservation
    
    COMPLETED --> [*]
    NO_SHOW --> [*]
```

---

### 3.5 Entity-Relationship (ER) Diagram & Normalization Analysis

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : places
    USERS ||--o{ VISITS : logs
    USERS ||--o{ ANNOUNCEMENTS : publishes
    SLOTS ||--o{ BOOKINGS : allocates

    USERS {
        int id PK
        string email UK
        string password_hash
        string full_name
        string phone
        string role
        datetime created_at
    }

    SLOTS {
        int id PK
        date slot_date
        int start_hour
        int end_hour
        int max_capacity
        int current_bookings
        datetime created_at
    }

    BOOKINGS {
        int id PK
        int user_id FK
        int slot_id FK
        string status
        datetime booked_at
        datetime cancelled_at
    }

    VISITS {
        int id PK
        int user_id FK
        datetime check_in_time
        datetime check_out_time
        int duration_minutes
        string check_in_type
    }

    GYM_CONFIG {
        int id PK
        string gym_name
        int max_capacity
        int current_occupancy
        int open_hour
        int close_hour
        datetime updated_at
    }

    ANNOUNCEMENTS {
        int id PK
        int author_id FK
        string title
        string content
        string priority
        datetime created_at
    }
```

#### Database Normalization Analysis (3NF Verification)
- **First Normal Form (1NF):** All attributes contain atomic, indivisible values. There are no repeating groups or multi-valued columns.
- **Second Normal Form (2NF):** All tables have a designated single surrogate primary key (`id`). All non-key attributes are fully functionally dependent on the primary key, eliminating partial key dependencies.
- **Third Normal Form (3NF):** No transitive dependencies exist. For instance, in the `BOOKINGS` table, `slot_date` and `start_hour` are not duplicated from `SLOTS`; they are referenced cleanly via the foreign key `slot_id`. `GYM_CONFIG` holds global single-row facility parameters rather than denormalizing them across every user record.

---

## 4. Database Schema (DDL) & Indexing Strategy

```sql
-- FitCrowd Production Schema (SQLite / PostgreSQL compatible)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK(role IN ('member', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Gym Configuration & Live State Table (Single-row design pattern)
CREATE TABLE IF NOT EXISTS gym_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    gym_name VARCHAR(100) NOT NULL DEFAULT 'FitCrowd Fitness Center',
    max_capacity INTEGER NOT NULL DEFAULT 100,
    current_occupancy INTEGER NOT NULL DEFAULT 0 CHECK(current_occupancy >= 0),
    open_hour INTEGER NOT NULL DEFAULT 6,
    close_hour INTEGER NOT NULL DEFAULT 22,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Daily Workout Slots Table
CREATE TABLE IF NOT EXISTS slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot_date DATE NOT NULL,
    start_hour INTEGER NOT NULL CHECK(start_hour >= 0 AND start_hour <= 23),
    end_hour INTEGER NOT NULL CHECK(end_hour >= 1 AND end_hour <= 24),
    max_capacity INTEGER NOT NULL DEFAULT 25 CHECK(max_capacity > 0),
    current_bookings INTEGER NOT NULL DEFAULT 0 CHECK(current_bookings >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_slot UNIQUE (slot_date, start_hour)
);

-- 4. Member Slot Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slot_id INTEGER NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'BOOKED' CHECK(status IN ('BOOKED', 'CHECKED_IN', 'CANCELLED', 'NO_SHOW')),
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    CONSTRAINT uq_user_slot UNIQUE (user_id, slot_id)
);

-- 5. Physical Visit Logs Table (Occupancy & Historical Training Data)
CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    check_in_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME,
    duration_minutes INTEGER,
    check_in_type VARCHAR(30) DEFAULT 'MANUAL_APP' CHECK(check_in_type IN ('MANUAL_APP', 'QR_SCAN', 'SIMULATION', 'ADMIN_COUNTER'))
);

-- 6. Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK(priority IN ('LOW', 'NORMAL', 'URGENT')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================
-- PERFORMANCE INDEXES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_slots_date_hour ON slots(slot_date, start_hour);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_visits_checkin ON visits(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visits_checkout ON visits(check_out_time);
```

---

## 5. REST API Specification

### Base URL: `/api`

| Endpoint | Method | Auth | Description | Status Codes |
| :--- | :---: | :---: | :--- | :--- |
| `/auth/register` | `POST` | Public | Register new member | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `/auth/login` | `POST` | Public | Authenticate user & return JWT | `200 OK`, `401 Unauthorized` |
| `/auth/me` | `GET` | Bearer | Get current authenticated user profile | `200 OK`, `401 Unauthorized` |
| `/crowd/live` | `GET` | Public | Get real-time occupancy, capacity & level | `200 OK` |
| `/crowd/predicted` | `GET` | Public | Get 24-hr predicted crowd for day-of-week | `200 OK`, `400 Bad Request` |
| `/crowd/recommend` | `GET` | Bearer | Get best time recommendation for user window | `200 OK`, `400 Bad Request` |
| `/crowd/check-in` | `POST` | Bearer | Record member check-in & increment count | `200 OK`, `400 Bad Request` |
| `/crowd/check-out`| `POST` | Bearer | Record member check-out & decrement count | `200 OK`, `400 Bad Request` |
| `/slots` | `GET` | Bearer | List slots for given date with availability | `200 OK`, `400 Bad Request` |
| `/bookings` | `POST` | Bearer | Atomic reservation of a time slot | `201 Created`, `409 Conflict`, `400 Bad Request` |
| `/bookings` | `GET` | Bearer | List current user's active & past bookings | `200 OK` |
| `/bookings/:id/cancel`| `PATCH`| Bearer | Cancel existing booking & restore capacity | `200 OK`, `404 Not Found`, `403 Forbidden` |
| `/admin/analytics`| `GET` | Admin | Aggregate peak hours, weekly trends, utilization | `200 OK`, `403 Forbidden` |
| `/admin/capacity` | `PATCH`| Admin | Update gym total floor capacity & slot defaults | `200 OK`, `400 Bad Request` |
| `/admin/simulator/surge`| `POST`| Admin | Trigger simulated crowd surge for evaluation | `200 OK` |
| `/admin/simulator/reset`| `POST`| Admin | Reset live occupancy to baseline | `200 OK` |

### Sample JSON Payloads

#### `GET /api/crowd/live` Response
```json
{
  "success": true,
  "data": {
    "currentOccupancy": 42,
    "maxCapacity": 100,
    "occupancyPercentage": 42.0,
    "crowdLevel": "LOW",
    "statusColor": "green",
    "updatedAt": "2026-11-13T16:00:00.000Z"
  }
}
```

#### `GET /api/crowd/recommend?date=2026-11-14&start=17&end=20` Response
```json
{
  "success": true,
  "data": {
    "requestedWindow": {
      "date": "2026-11-14",
      "dayOfWeek": 6,
      "dayName": "Saturday",
      "startHour": 17,
      "endHour": 20
    },
    "bestSlot": {
      "startHour": 19,
      "endHour": 20,
      "timeLabel": "7:00 PM - 8:00 PM",
      "predictedOccupancy": 28,
      "occupancyPercentage": 28.0,
      "crowdLevel": "LOW",
      "availableSlotId": 48
    },
    "rankedAlternatives": [
      { "hour": 17, "predicted": 52, "level": "MEDIUM" },
      { "hour": 18, "predicted": 74, "level": "HIGH" }
    ]
  }
}
```

---

## 6. Crowd Prediction Engine Design

### 6.1 Mathematical Formulation: Time-Bucket Moving Average
Gym attendance exhibits strong **seasonality** tied directly to the day of the week ($d \in [0, 6]$) and the hour of the day ($h \in [6, 22]$). A Monday evening at 18:00 has significantly higher expected attendance than a Monday morning at 11:00 or a Sunday evening at 18:00.

Let $C(w, d, h)$ denote the observed occupancy during week $w$, day of week $d$, and hour $h$.
The moving average prediction for window $W$ (default: previous 4 weeks) is formulated as:

$$\hat{C}(d, h) = \frac{1}{|W|} \sum_{w \in W} C(w, d, h)$$

To give higher influence to more recent weeks, FitCrowd supports an **Exponentially Weighted Moving Average (EWMA)** formulation:

$$\hat{C}_t(d, h) = \alpha \cdot C_t(d, h) + (1 - \alpha) \cdot \hat{C}_{t-1}(d, h)$$
where $\alpha \in [0.2, 0.4]$ is the smoothing factor.

### 6.2 Regression Strategy (Machine Learning Formulation)
For continuous feature modeling, the system maps features $\mathbf{x} = [h, h^2, \text{is\_weekend}, \text{recent\_30min\_trend}]$ to predict expected occupancy $\hat{y}$:

$$\hat{y} = \beta_0 + \beta_1 h + \beta_2 h^2 + \beta_3 D_{\text{weekend}} + \epsilon$$

Quadratic term $h^2$ captures the non-linear inverted U-shape curve of gym attendance peaks.

### 6.3 Evaluation Metric: Mean Absolute Error (MAE)
Accuracy is quantified against ground-truth validation data using MAE:

$$\text{MAE} = \frac{1}{N} \sum_{i=1}^N \left| y_i - \hat{y}_i \right|$$

- **Target Benchmark:** $\text{MAE} \le 5.0\text{ persons}$ across all 1-hour operating buckets.
- **Academic Merit:** MAE is chosen over Mean Squared Error (MSE) because it provides a direct, interpretable metric in units of "number of people" without disproportionately penalizing single anomalous spikes.

### 6.4 Cold-Start Handling Strategy
When a new fitness center is initialized or historical data for a specific bucket is absent ($N = 0$):
1. **Prior Baseline Curve:** The system initializes with an empirically grounded normalized bell curve:
   $$B(h) = \begin{cases} 
   0.65 \cdot C_{\max} & \text{for } h \in [7, 9] \quad (\text{Morning Rush}) \\
   0.30 \cdot C_{\max} & \text{for } h \in [11, 15] \quad (\text{Mid-day Low}) \\
   0.85 \cdot C_{\max} & \text{for } h \in [17, 20] \quad (\text{Evening Peak}) \\
   0.20 \cdot C_{\max} & \text{otherwise}
   \end{cases}$$
2. **Bayesian Blending:** As new visit logs are recorded, the prediction dynamically blends the prior baseline with observed data:
   $$\hat{C}_{\text{blended}} = \left(1 - \frac{N}{K}\right) B(h) + \left(\frac{N}{K}\right) \bar{C}_{\text{observed}}$$
   where $K = 14$ days is the threshold after which purely empirical data takes full precedence.

---

## 7. Scalability, Concurrency, Caching & Security

### 7.1 Concurrency & Overbooking Elimination (Zero-Overbooking Guarantee)
In high-demand fitness centers, popular evening slots can sell out in fractions of a second. If multiple concurrent requests read `current_bookings = 19` for a `max_capacity = 20` slot, all might execute an `INSERT`, pushing the count to 23 (Time-of-Check to Time-of-Use / TOCTOU anomaly).

FitCrowd guarantees zero overbooking via a three-tier defense:
1. **Atomic Transaction Isolation (`BEGIN IMMEDIATE` in SQLite / `SELECT ... FOR UPDATE` in PostgreSQL):**
   Prevents concurrent read-write interleaving on the slot record.
2. **Conditional Atomic Update Query:**
   ```sql
   UPDATE slots 
   SET current_bookings = current_bookings + 1 
   WHERE id = :slotId AND current_bookings < max_capacity;
   ```
   If the rows affected is $0$, the slot has already been claimed by a rival transaction; the application immediately aborts and returns HTTP 409 Conflict.
3. **Database Unique Compound Constraint:**
   `CONSTRAINT uq_user_slot UNIQUE (user_id, slot_id)` prevents the same member from booking multiple times even if they double-click rapidly.

### 7.2 Security Architecture & OWASP Defense
- **SQL Injection Prevention:** 100% of queries use parameterized bindings (`db.prepare('... WHERE id = ?').run(id)`). Zero dynamic string concatenation.
- **Cross-Site Scripting (XSS):** React automatically escapes JSX expressions. HTTP response headers set `Content-Security-Policy` and `X-Content-Type-Options: nosniff`.
- **Stateless Authorization (Broken Object Level Authorization - BOLA):** In all booking cancellation and profile endpoints, the query filters by `user_id` extracted from the verified JWT payload, preventing IDOR (Insecure Direct Object Reference) attacks.
- **Cryptographic Hashing:** Passwords hashed with `bcryptjs` using a minimum salt rounds factor of 10.

---

## 8. Design Patterns Catalog

| Pattern | Where Used in FitCrowd | Concrete Purpose & Academic Value |
| :--- | :--- | :--- |
| **Repository Pattern** | `backend/src/repositories/*` | Decouples SQL database queries from business rules in services; enables swapping SQLite for PostgreSQL without touching domain logic. |
| **Strategy Pattern** | `backend/src/services/prediction/*` | Defines an interchangeable family of prediction algorithms (`TimeBucketStrategy`, `RegressionStrategy`), conforming to `IPredictionStrategy`. |
| **Singleton Pattern** | `backend/src/models/db.js` | Ensures exactly one shared database connection pool exists across the application lifecycle. |
| **Middleware Pattern** | `backend/src/middlewares/*` | Intercepts HTTP requests for centralized JWT extraction, schema validation, and RBAC authorization. |
| **Factory Pattern** | `backend/scripts/seedData.js` | Generates realistic synthetic visit entities based on day-of-week probability distributions. |

---

*End of System Design Specification (Phase 3).*  
*Next Stage: Phase 4 – Implementation (Sprints 1 to 4).*
