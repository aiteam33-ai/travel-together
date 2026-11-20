import { BRAND } from "@/lib/brand";
import "./overview.css";

const JOURNEY_STEPS = ["Discover a trip", "Invite your group", "Plan together", "Calculate the cost", "Book", "Split expenses"];

export default function ProductOverviewPage() {
  return (
    <div className="overview-doc">
      <section className="overview-page">
        <header className="overview-title">
          <p className="overview-kicker">Travel, Together</p>
          <h1>A tour and trek booking platform where you plan, book and share the trip with your people.</h1>
        </header>

        <section>
          <h2>Overview</h2>
          <p>
            We are building a web platform for discovering and booking tours and treks. It does what other travel
            platforms do: search, filters, tour details, clear prices and online booking. What we add is a
            collaborative layer called My Socials, made for people who travel together. Friends or family connect
            in one shared trip space, plan together, see what the trip will cost, book it, and keep track of
            shared expenses, all on the same platform.
          </p>
        </section>

        <section>
          <h2>Problem statement</h2>
          <p>
            Planning a group trip means working across several disconnected tools. The group finds tours on one
            website, discusses them in a messaging app, works out the budget in a spreadsheet, splits costs by
            hand, and then goes back to a booking site to pay. Information gets scattered, the total cost and each
            person&apos;s share stay unclear, and the same conversations are repeated.
          </p>
          <p>
            Who faces it: friends, families, couples travelling together, student groups and small communities. It
            falls hardest on the one person who organises the trip, pays upfront and then follows up on who has
            paid what.
          </p>
        </section>

        <section>
          <h2>Solution</h2>
          <p>
            One platform that joins tour booking with group planning. Travellers discover and compare tours, create
            a group in My Socials, invite their friends, plan together, calculate the total and per-person cost,
            book online and split shared expenses, without switching between a booking site, a chat group and a
            spreadsheet.
          </p>
        </section>

        <footer className="overview-footer">{BRAND.name} — Product Overview · Page 1 of 2</footer>
      </section>

      <section className="overview-page">
        <section>
          <h2>My Socials: what it includes</h2>
          <ul>
            <li><strong>Connect with friends:</strong> create a trip group and invite people by link or mobile number.</li>
            <li><strong>Shared trip space:</strong> the chosen tour, dates, members and updates in one place that everyone can see.</li>
            <li><strong>Plan together:</strong> shortlist tours, post updates and comment.</li>
            <li><strong>Expense calculator:</strong> the estimated total and per-person cost for the group, from the same pricing used at checkout.</li>
            <li><strong>Split expenses:</strong> record who paid, choose who shares the cost, split equally or by custom amounts, see who owes whom, and mark settlements.</li>
            <li><strong>Book together:</strong> the organiser books for the group, and members can follow the booking status.</li>
          </ul>
        </section>

        <section>
          <h2>How it works</h2>
          <ol className="overview-journey">
            {JOURNEY_STEPS.map((step, i) => (
              <li key={step}>
                <span className="overview-journey-num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2>What makes it different</h2>
          <p className="overview-emphasis">
            Most travel platforms help you book a trip. This one also helps you plan it with the people you are
            travelling with, from the first idea to the final expense.
          </p>
        </section>

        <section>
          <h2>The product, as built</h2>
          <div className="overview-screens">
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/overview-screenshots/group-overview.jpg" alt="A group's shared trip space, showing the activity feed and who has joined" />
              <figcaption>Shared trip space</figcaption>
            </figure>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/overview-screenshots/expenses-split.jpg" alt="Shared expenses split among group members, with balances and suggested settlements" />
              <figcaption>Shared expenses &amp; balances</figcaption>
            </figure>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/overview-screenshots/calculator.jpg" alt="The Trip Expense Calculator showing a full cost breakdown" />
              <figcaption>Trip Expense Calculator</figcaption>
            </figure>
          </div>
        </section>

        <footer className="overview-footer">{BRAND.name} — Product Overview · Page 2 of 2</footer>
      </section>
    </div>
  );
}
