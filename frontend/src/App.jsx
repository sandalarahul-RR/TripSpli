import { useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api/trips";

function App() {
  const [homeMode, setHomeMode] = useState("choice");
  const [tripName, setTripName] = useState("");
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [votingMemberId, setVotingMemberId] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberBudget, setMemberBudget] = useState("");
  const [memberInterests, setMemberInterests] = useState("");
  const [memberTravelStyle, setMemberTravelStyle] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [summary, setSummary] = useState(null);
  const [settlement, setSettlement] = useState([]);
  const [showTrips, setShowTrips] = useState(false);
  const [trips, setTrips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [error, setError] = useState("");

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const loadTrips = async (mode = "plan") => {
    try {
      setLoadingTrips(true);
      setError("");

      const response = await axios.get(API);
      setTrips(response.data);
      setShowTrips(true);
      setHomeMode(mode);
    } catch {
      setError("Unable to load saved trips. Check that the backend is running.");
    } finally {
      setLoadingTrips(false);
    }
  };

  const createTrip = async (event) => {
    event.preventDefault();

    if (!tripName.trim() || saving) return;

    try {
      setSaving(true);
      setError("");

      const response = await axios.post(API, {
        name: tripName.trim()
      });

      setTrip({
        ...response.data,
        status: response.data.status || "PLANNING"
      });

      setMembers([]);
      setDestinations([]);
      setSelectedDestination("");
      setVotingMemberId("");
      setExpenses([]);
      setSummary(null);
      setSettlement([]);
      setTripName("");
      setShowTrips(false);
      setHomeMode("plan");
    } catch {
      setError("Could not create the trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openTrip = async (selectedTrip) => {
    try {
      setError("");
      setSaving(true);

      const [memberResponse, expenseResponse, destinationResponse] =
        await Promise.all([
          axios.get(`${API}/${selectedTrip.id}/members`),
          axios.get(`${API}/${selectedTrip.id}/expenses`),
          axios.get(`${API}/${selectedTrip.id}/destinations`)
        ]);

      const savedTrip = {
        ...selectedTrip,
        status: selectedTrip.status || "PLANNING"
      };

      setTrip(savedTrip);
      setMembers(memberResponse.data);
      setExpenses(expenseResponse.data);
      setDestinations(destinationResponse.data);

      setSelectedDestination(
        savedTrip.selectedDestination || ""
      );

      setVotingMemberId(
        memberResponse.data[0]?.id
          ? String(memberResponse.data[0].id)
          : ""
      );

      setMemberName("");
      setMemberBudget("");
      setMemberInterests("");
      setMemberTravelStyle("");
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSummary(null);
      setSettlement([]);
      setShowTrips(false);
    } catch {
      setError("Unable to open this trip. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();

    if (!memberName.trim() || !trip || saving) return;

    if (memberBudget !== "" && Number(memberBudget) < 0) {
      setError("Budget cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await axios.post(`${API}/${trip.id}/members`, {
        name: memberName.trim(),
        budget: memberBudget === "" ? null : Number(memberBudget),
        interests: memberInterests.trim(),
        travelStyle: memberTravelStyle
      });

      setMembers((previous) => [...previous, response.data]);
      setMemberName("");
      setMemberBudget("");
      setMemberInterests("");
      setMemberTravelStyle("");
      setSummary(null);
      setSettlement([]);
    } catch {
      setError(
        "Could not add the member. Check that Member.java contains budget, interests, and travelStyle."
      );
    } finally {
      setSaving(false);
    }
  };

  const generateRecommendations = async () => {
    if (!trip || members.length === 0 || loadingDestinations) {
      setError("Add at least one group member before generating recommendations.");
      return;
    }

    const interests = members
      .map((member) => (member.interests || "").toLowerCase())
      .join(" ");

    const styles = members
      .map((member) => (member.travelStyle || "").toLowerCase())
      .join(" ");

    const budgets = members
      .map((member) => Number(member.budget))
      .filter((value) => Number.isFinite(value) && value > 0);

    const averageBudget = budgets.length
      ? budgets.reduce((sum, value) => sum + value, 0) / budgets.length
      : 15000;

    const options = [
      {
        destinationName: "Goa",
        estimatedCost: 12000,
        description: "Beaches, local food, water activities and nightlife.",
        tags: "beach food adventure relaxed"
      },
      {
        destinationName: "Jaipur",
        estimatedCost: 9000,
        description: "Forts, heritage, markets and Rajasthani food.",
        tags: "history culture food shopping"
      },
      {
        destinationName: "Manali",
        estimatedCost: 14000,
        description: "Mountain views, nature walks and adventure activities.",
        tags: "nature adventure mountains relaxed"
      },
      {
        destinationName: "Mysuru and Coorg",
        estimatedCost: 11000,
        description: "Palaces, coffee estates, waterfalls and nature.",
        tags: "nature culture relaxed food"
      },
      {
        destinationName: "Pondicherry",
        estimatedCost: 10000,
        description: "Coastal cafes, colourful streets and a relaxed seaside break.",
        tags: "beach food relaxed culture"
      },
      {
        destinationName: "Rishikesh",
        estimatedCost: 8500,
        description: "River views, yoga, rafting and outdoor activities.",
        tags: "nature adventure relaxed"
      },
      {
        destinationName: "Mumbai",
        estimatedCost: 16000,
        description: "City attractions, shopping, food and coastal views.",
        tags: "food shopping culture adventure"
      },
      {
        destinationName: "Ooty",
        estimatedCost: 10000,
        description: "Cool weather, gardens, tea estates and scenic viewpoints.",
        tags: "nature relaxed mountains"
      }
    ];

    const ranked = options
      .map((option) => {
        let score = 0;

        score += option.tags
          .split(" ")
          .filter((tag) => interests.includes(tag)).length * 3;

        score += averageBudget >= option.estimatedCost
          ? 3
          : -Math.min(5, (option.estimatedCost - averageBudget) / 3000);

        if (styles.includes("budget") && option.estimatedCost <= 10000) {
          score += 2;
        }

        if (
          (styles.includes("adventure") || interests.includes("adventure")) &&
          option.tags.includes("adventure")
        ) {
          score += 2;
        }

        if (
          (styles.includes("relaxed") || interests.includes("relax")) &&
          option.tags.includes("relaxed")
        ) {
          score += 2;
        }

        if (styles.includes("luxury") && option.estimatedCost >= 12000) {
          score += 1;
        }

        return { ...option, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    try {
      setLoadingDestinations(true);
      setError("");

      const existingNames = new Set(
        destinations.map((item) => item.destinationName.toLowerCase())
      );

      const added = [...destinations];

      for (const option of ranked) {
        if (existingNames.has(option.destinationName.toLowerCase())) {
          continue;
        }

        const response = await axios.post(
          `${API}/${trip.id}/destinations`,
          {
            destinationName: option.destinationName,
            estimatedCost: option.estimatedCost,
            description: `${option.description} Approximate cost per person; actual prices vary.`
          }
        );

        added.push(response.data);
        existingNames.add(option.destinationName.toLowerCase());
      }

      setDestinations(added);

      if (added.length === 0) {
        setError("No recommendations could be saved. Try again.");
      }
    } catch {
      setError(
        "Could not save destination suggestions. Check the backend destination endpoints."
      );
    } finally {
      setLoadingDestinations(false);
    }
  };

  const voteForDestination = async (destinationId) => {
    if (!trip || !votingMemberId) {
      setError("Choose the group member who is voting first.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.post(
        `${API}/${trip.id}/destinations/${destinationId}/vote`,
        { memberId: Number(votingMemberId) }
      );

      const response = await axios.get(
        `${API}/${trip.id}/destinations`
      );

      setDestinations(response.data);
    } catch {
      setError("Could not save the vote. Check that this member belongs to the trip.");
    } finally {
      setSaving(false);
    }
  };

  const chooseDestination = (destinationName) => {
    setSelectedDestination(destinationName);
    setError("");
  };

  const startTrip = async () => {
    if (!trip || !selectedDestination) {
      setError("Select a destination before starting the trip.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.put(`${API}/${trip.id}/destination`, {
        selectedDestination: selectedDestination
      });

      await axios.put(`${API}/${trip.id}/status`, {
        status: "ACTIVE"
      });

      setTrip((previous) => ({
        ...previous,
        selectedDestination: selectedDestination,
        status: "ACTIVE"
      }));
    } catch {
      setError("Could not start the trip. Check the destination and status endpoints.");
    } finally {
      setSaving(false);
    }
  };

  const completeTrip = async () => {
    if (!trip) return;

    try {
      setSaving(true);
      setError("");

      await axios.put(`${API}/${trip.id}/status`, {
        status: "COMPLETED"
      });

      setTrip((previous) => ({
        ...previous,
        status: "COMPLETED"
      }));
    } catch {
      setError("Could not mark the trip as completed.");
    } finally {
      setSaving(false);
    }
  };

  const addExpense = async (event) => {
    event.preventDefault();

    if (
      !description.trim() ||
      amount === "" ||
      Number(amount) <= 0 ||
      !paidBy ||
      !trip ||
      trip.status !== "ACTIVE" ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await axios.post(`${API}/${trip.id}/expenses`, {
        description: description.trim(),
        amount: Number(amount),
        paidBy: { id: Number(paidBy) }
      });

      setExpenses((previous) => [...previous, response.data]);
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSummary(null);
      setSettlement([]);
    } catch {
      setError("Could not add the expense. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const calculateSummary = async () => {
    if (!trip) return;

    try {
      setError("");

      const [summaryResponse, settlementResponse] = await Promise.all([
        axios.get(`${API}/${trip.id}/summary`),
        axios.get(`${API}/${trip.id}/settlement`)
      ]);

      setSummary(summaryResponse.data);
      setSettlement(settlementResponse.data);
    } catch {
      setError("Unable to calculate the summary. Please try again.");
    }
  };

  const returnHome = () => {
    setTrip(null);
    setShowTrips(false);
    setMembers([]);
    setDestinations([]);
    setVotingMemberId("");
    setSelectedDestination("");
    setExpenses([]);
    setSummary(null);
    setSettlement([]);
    setError("");
    setHomeMode("choice");
  };

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  return (
    <div className="app">
      <header className="main-header">
        <button className="brand-button" onClick={returnHome}>
          TripSpli<span>.</span>
        </button>
        <p>Plan Together. Spend Smarter.</p>
      </header>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {!trip && !showTrips && homeMode === "choice" && (
        <section style={{ maxWidth: "1050px", margin: "35px auto 60px", padding: "0 12px" }}>
          <div style={{ textAlign: "center", marginBottom: "35px" }}>
            <span className="eyebrow">WELCOME TO TRIPSPLI</span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.3rem)", margin: "14px 0", color: "var(--text)" }}>
              Every trip starts with a plan.
            </h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
              Plan your next adventure or analyse the expenses of a trip you've already taken.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "24px" }}>
            <article className="card" style={{ padding: "30px", margin: 0 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "18px" }}>✈️</div>
              <span className="eyebrow">YOUR NEXT ADVENTURE</span>
              <h2 style={{ margin: "12px 0" }}>Plan a Trip</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
                Add your group, discover destinations, vote together, plan your itinerary, and estimate your budget.
              </p>
              <button style={{ width: "100%", marginTop: "18px" }} onClick={() => setHomeMode("plan")}>
                Plan a Trip →
              </button>
            </article>

            <article className="card" style={{ padding: "30px", margin: 0 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "18px" }}>📊</div>
              <span className="eyebrow">YOUR PAST ADVENTURES</span>
              <h2 style={{ margin: "12px 0" }}>Analyse a Trip</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>
                Review trip expenses, calculate the cost per person, understand spending, and compare budgets.
              </p>
              <button className="secondary-button" style={{ width: "100%", marginTop: "18px" }} onClick={() => setHomeMode("analyse")}>
                Analyse a Trip →
              </button>
            </article>
          </div>

          <div style={{ textAlign: "center", marginTop: "28px" }}>
            <button className="secondary-button" onClick={() => loadTrips("plan")} disabled={loadingTrips}>
              {loadingTrips ? "Loading..." : "My Trips"}
            </button>
          </div>
        </section>
      )}

      {!trip && !showTrips && homeMode === "plan" && (
        <section className="card create-trip-card">
          <button type="button" className="back-button" onClick={() => setHomeMode("choice")}>← Back</button>
          <span className="eyebrow">YOUR NEXT ADVENTURE</span>
          <h2>Create Trip</h2>
          <p>Where will your next journey take you?</p>

          <form onSubmit={createTrip}>
            <input type="text" placeholder="Enter your trip name" value={tripName} onChange={(event) => setTripName(event.target.value)} maxLength={100} required />
            <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Trip"}</button>
          </form>

          <button className="secondary-button" onClick={() => loadTrips("plan")} disabled={loadingTrips}>
            {loadingTrips ? "Loading Trips..." : "My Trips"}
          </button>
        </section>
      )}

      {!trip && !showTrips && homeMode === "analyse" && (
        <section className="card create-trip-card">
          <button type="button" className="back-button" onClick={() => setHomeMode("choice")}>← Back</button>
          <span className="eyebrow">UNDERSTAND YOUR SPENDING</span>
          <h2>Analyse a Trip</h2>
          <p>Select a saved trip to review its expenses, or enter the details of a completed trip.</p>
          <button onClick={() => loadTrips("analyse")} disabled={loadingTrips}>
            {loadingTrips ? "Loading Trips..." : "View My Trips →"}
          </button>
          <p style={{ marginTop: "16px", fontSize: "0.9rem" }}>
            Historical trip entry and detailed reports will be added next.
          </p>
        </section>
      )}

      {!trip && showTrips && (
        <section className="card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR ADVENTURES</span>
              <h2>{homeMode === "analyse" ? "Analyse a Trip" : "My Trips"}</h2>
              <p>{homeMode === "analyse" ? "Select a trip to review its recorded expenses." : "Continue planning your saved adventures."}</p>
            </div>
          </div>

          {trips.length === 0 ? (
            <div className="empty-dashboard">
              <h3>No trips yet</h3>
              <p>Create your first trip to get started.</p>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map((item, index) => (
                <article className="trip-tile" key={item.id}>
                  <div className={`trip-tile-art art-${index % 3}`}>
                    <span className="trip-art-symbol">✦</span>
                    <span className="trip-number">TRIP #{item.id}</span>
                  </div>
                  <div className="trip-tile-content">
                    <h3>{item.name}</h3>
                    <button className="open-trip-button" onClick={() => openTrip(item)} disabled={saving}>
                      {saving ? "Opening..." : homeMode === "analyse" ? "Review Expenses →" : "Open Trip →"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <button className="secondary-button" onClick={() => { setShowTrips(false); setHomeMode("choice"); }}>
            ← Back to Home
          </button>
        </section>
      )}

      {trip && (
        <>
          <button className="back-button" onClick={returnHome}>← Back to Home</button>

          <section className="card trip-card">
            <span className="eyebrow">YOUR ADVENTURE</span>
            <h2>{trip.name}</h2>
            <p>Trip ID: {trip.id}</p>
            <p>Status: <strong>{trip.status || "PLANNING"}</strong></p>
          </section>

          <section className="card">
            <h2>👥 Group Members & Preferences</h2>

            {trip.status === "PLANNING" && (
              <form onSubmit={addMember} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: "12px", marginTop: "18px" }}>
                <input type="text" placeholder="Member name" value={memberName} onChange={(event) => setMemberName(event.target.value)} maxLength={100} required />
                <input type="number" placeholder="Budget in ₹ (optional)" value={memberBudget} onChange={(event) => setMemberBudget(event.target.value)} min="0" step="0.01" />
                <input type="text" placeholder="Interests: food, nature, shopping" value={memberInterests} onChange={(event) => setMemberInterests(event.target.value)} maxLength={250} />
                <select value={memberTravelStyle} onChange={(event) => setMemberTravelStyle(event.target.value)}>
                  <option value="">Choose travel style</option>
                  <option value="Budget">Budget</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Comfort">Comfort</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Relaxed">Relaxed</option>
                </select>
                <button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Member"}</button>
              </form>
            )}

            <div className="member-list" style={{ marginTop: "20px" }}>
              {members.map((member) => (
                <div className="member" key={member.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "5px", padding: "14px" }}>
                  <strong>{member.name}</strong>
                  {member.budget !== null && member.budget !== undefined && <span>Budget: {formatMoney(member.budget)}</span>}
                  {member.interests && <span>Interests: {member.interests}</span>}
                  {member.travelStyle && <span>Travel style: {member.travelStyle}</span>}
                </div>
              ))}
            </div>

            {members.length === 0 && <p className="empty-message">No members yet. Add people and their preferences!</p>}
          </section>

          {trip.status === "PLANNING" && (
            <section className="card">
              <h2>🗺️ Destination Recommendations</h2>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                Suggestions use your group's interests, travel styles and entered budgets. Costs are rough estimates, not live prices.
              </p>

              <button onClick={generateRecommendations} disabled={loadingDestinations || members.length === 0}>
                {loadingDestinations ? "Generating..." : destinations.length ? "Refresh / Add Recommendations" : "Generate Recommendations"}
              </button>

              {destinations.length > 0 && (
                <>
                  <div style={{ marginTop: "20px", maxWidth: "360px" }}>
                    <label htmlFor="voting-member">Member casting the vote</label>
                    <select id="voting-member" value={votingMemberId} onChange={(event) => setVotingMemberId(event.target.value)}>
                      <option value="">Choose member</option>
                      {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: "14px", marginTop: "18px" }}>
                    {destinations.slice().sort((a, b) => Number(b.voteCount || 0) - Number(a.voteCount || 0)).map((destination) => (
                      <article className="card" key={destination.id} style={{ margin: 0, padding: "18px", border: selectedDestination === destination.destinationName ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                        <h3>{destination.destinationName}</h3>
                        <p>{destination.description}</p>
                        <p><strong>Estimated cost:</strong> {formatMoney(destination.estimatedCost)}</p>
                        <p><strong>Votes:</strong> {destination.voteCount || 0}</p>

                        <button type="button" onClick={() => voteForDestination(destination.id)} disabled={saving || !members.length || !votingMemberId}>
                          Vote for this destination
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          style={{ marginTop: "8px" }}
                          onClick={() => chooseDestination(destination.destinationName)}
                        >
                          {selectedDestination === destination.destinationName ? "Selected ✓" : "Select destination"}
                        </button>
                      </article>
                    ))}
                  </div>

                  <div style={{ marginTop: "20px", padding: "18px", borderRadius: "12px", background: "var(--primary-light)" }}>
                    <strong>Chosen destination: </strong>
                    {selectedDestination || "Not selected yet"}

                    <p style={{ margin: "8px 0 14px" }}>
                      Choose the destination your group agrees on, then start the trip to unlock expense tracking.
                    </p>

                    <button type="button" onClick={startTrip} disabled={saving || !selectedDestination || members.length === 0}>
                      {saving ? "Starting..." : "🚀 Start Trip"}
                    </button>
                  </div>
                </>
              )}

              {destinations.length === 0 && <p className="empty-message">Add group members, then generate recommendations.</p>}
            </section>
          )}

          {trip.status === "ACTIVE" && (
            <section className="card">
              <h2>🚀 Trip In Progress</h2>
              <p><strong>Destination:</strong> {trip.selectedDestination || selectedDestination || "Not selected"}</p>
              <p>Expense tracking is now unlocked.</p>
              <button className="secondary-button" onClick={completeTrip} disabled={saving}>Mark Trip Completed</button>
            </section>
          )}

          {trip.status === "COMPLETED" && (
            <section className="card">
              <h2>✅ Trip Completed</h2>
              <p><strong>Destination:</strong> {trip.selectedDestination || selectedDestination || "Not selected"}</p>
              <p>Review your recorded expenses and settlement below.</p>
            </section>
          )}

          {(trip.status === "ACTIVE" || trip.status === "COMPLETED") && (
            <section className="card">
              <h2>💸 Recorded Expenses</h2>
              <p style={{ color: "var(--muted)", marginBottom: "18px" }}>Record trip expenses and track who paid.</p>

              <form onSubmit={addExpense}>
                <input type="text" placeholder="Expense description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={150} required />
                <input type="number" placeholder="Amount in ₹" value={amount} onChange={(event) => setAmount(event.target.value)} min="0.01" step="0.01" required />
                <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)} required>
                  <option value="">Who paid?</option>
                  {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
                <button type="submit" disabled={saving || members.length === 0 || trip.status !== "ACTIVE"}>
                  {saving ? "Saving..." : trip.status === "COMPLETED" ? "Trip Completed" : "Add Expense"}
                </button>
              </form>

              <div className="expense-list">
                {expenses.map((expense) => (
                  <div className="expense" key={expense.id}>
                    <span>{expense.description}</span>
                    <span>{formatMoney(expense.amount)}</span>
                    <span>{expense.paidBy?.name || "Unknown"}</span>
                  </div>
                ))}
              </div>

              {expenses.length === 0 && <p className="empty-message">No expenses have been recorded yet.</p>}

              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "18px", padding: "16px", borderRadius: "12px", background: "var(--primary-light)" }}>
                <strong>Total Recorded Expenses</strong>
                <strong>{formatMoney(totalExpenses)}</strong>
              </div>
            </section>
          )}

          {(trip.status === "ACTIVE" || trip.status === "COMPLETED") && (
            <section className="card">
              <h2>💰 Trip Summary</h2>
              <button onClick={calculateSummary}>Calculate Summary</button>

              {summary && (
                <>
                  <div className="summary-grid">
                    <div className="summary-box"><span>Total Expenses</span><strong>{formatMoney(summary.total)}</strong></div>
                    <div className="summary-box"><span>People</span><strong>{summary.members}</strong></div>
                    <div className="summary-box"><span>Per Person</span><strong>{formatMoney(summary.share)}</strong></div>
                  </div>

                  <h2 className="section-title">Balances</h2>
                  <div className="balance-list">
                    {summary.balances.map((balance) => (
                      <div className="balance-card" key={balance.member}>
                        <div>
                          <h3>{balance.member}</h3>
                          <p>Paid {formatMoney(balance.paid)}</p>
                        </div>
                        <strong className={Number(balance.balance) >= 0 ? "positive" : "negative"}>
                          {Number(balance.balance) >= 0 ? "+" : "-"}
                          {formatMoney(Math.abs(Number(balance.balance)))}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <h2 className="section-title">🤝 Who Pays Whom?</h2>
                  {settlement.length === 0 ? (
                    <div className="settled">🎉 Everyone is settled!</div>
                  ) : (
                    <div className="settlement-list">
                      {settlement.map((payment, index) => (
                        <div className="settlement-card" key={index}>
                          <div className="person">
                            <strong>{payment.from}</strong>
                            <span> pays </span>
                            <strong>{payment.to}</strong>
                          </div>
                          <div className="payment">{formatMoney(payment.amount)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </>
      )}

      <footer>
        <p>Made for the journeys worth remembering.</p>
        <span>TRIPSPLI © 2026</span>
      </footer>
    </div>
  );
}

export default App;