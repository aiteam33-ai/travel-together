"""
Generates docs/Travel-Together-PRD.pdf: a 4-5 page Product Requirements
Document for the "Travel, Together" platform and its My Socials layer.
Pure content generation (reportlab) — no app code or UI implementation here.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    ListFlowable, ListItem, NextPageTemplate, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas as canvas_module

ACCENT = colors.HexColor("#B23C0A")
ACCENT_STRONG = colors.HexColor("#8C2F07")
INK = colors.HexColor("#3B2415")
MUTED = colors.HexColor("#6B4F3B")
BORDER = colors.HexColor("#E8D9C3")
SOFT = colors.HexColor("#FDF6EC")

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm
OUT_PATH = "docs/Travel-Together-PRD.pdf"

styles = getSampleStyleSheet()
title_style = ParagraphStyle("TitleDoc", fontName="Helvetica-Bold", fontSize=23, leading=27, textColor=INK, spaceAfter=6)
subtitle_style = ParagraphStyle("SubtitleDoc", fontName="Helvetica", fontSize=11.5, leading=15, textColor=MUTED)
kicker_style = ParagraphStyle("Kicker", fontName="Helvetica-Bold", fontSize=12, textColor=ACCENT, spaceAfter=8)
h1_style = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=13.5, leading=16, textColor=ACCENT_STRONG, spaceBefore=10, spaceAfter=4)
h2_style = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=INK, spaceBefore=5, spaceAfter=2)
body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=8.7, leading=11.6, textColor=INK, spaceAfter=3)
body_italic = ParagraphStyle("BodyItalic", parent=body_style, fontName="Helvetica-Oblique", textColor=MUTED)
bullet_style = ParagraphStyle("Bullet", parent=body_style, leftIndent=2, spaceAfter=2)
cell_style = ParagraphStyle("Cell", fontName="Helvetica", fontSize=8.2, leading=10.8, textColor=INK)
cell_head_style = ParagraphStyle("CellHead", parent=cell_style, fontName="Helvetica-Bold", textColor=colors.white)


def P(text, style=body_style):
    return Paragraph(text, style)


def bullets(items, style=bullet_style, space_after=5):
    return ListFlowable(
        [ListItem(P(t, style), leftIndent=9, spaceAfter=1) for t in items],
        bulletType="bullet", start="square", bulletColor=ACCENT, leftIndent=12,
        spaceBefore=1, spaceAfter=space_after,
    )


def make_table(header, rows, col_widths, head_bg=ACCENT_STRONG, font_size=8.2):
    cs = ParagraphStyle("c", parent=cell_style, fontSize=font_size, leading=font_size + 2.4)
    chs = ParagraphStyle("ch", parent=cell_head_style, fontSize=font_size, leading=font_size + 2.4)
    data = [[Paragraph(h, chs) for h in header]]
    for r in rows:
        data.append([Paragraph(str(c), cs) if c else Paragraph("", cs) for c in r])
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), head_bg),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SOFT]),
        ("TOPPADDING", (0, 0), (-1, -1), 3.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def draw_header_footer(c: canvas_module.Canvas, doc):
    c.saveState()
    page_num = c.getPageNumber()
    if page_num > 1:
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(ACCENT)
        c.drawString(MARGIN, PAGE_H - 12 * mm, "TRAVEL, TOGETHER")
        c.setFont("Helvetica", 7.5)
        c.setFillColor(MUTED)
        c.drawRightString(PAGE_W - MARGIN, PAGE_H - 12 * mm, "Product Requirements Document")
        c.setStrokeColor(BORDER)
        c.line(MARGIN, PAGE_H - 13.5 * mm, PAGE_W - MARGIN, PAGE_H - 13.5 * mm)
    c.setFont("Helvetica", 7.5)
    c.setFillColor(MUTED)
    c.drawCentredString(PAGE_W / 2, 10 * mm, f"Page {page_num}")
    c.restoreState()


doc = BaseDocTemplate(
    OUT_PATH, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN, topMargin=MARGIN, bottomMargin=MARGIN,
    title="Travel, Together: Product Requirements Document",
)
frame_title = Frame(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN, id="title")
frame_body = Frame(MARGIN, MARGIN, PAGE_W - 2 * MARGIN, PAGE_H - 2 * MARGIN - 7 * mm, id="body")
doc.addPageTemplates([
    PageTemplate(id="TitlePage", frames=[frame_title], onPage=lambda c, d: None),
    PageTemplate(id="BodyPage", frames=[frame_body], onPage=draw_header_footer),
])

story = []

# ---------------------------------------------------------------- Title page
story.append(Spacer(1, 55 * mm))
story.append(Paragraph("TRAVEL, TOGETHER", kicker_style))
story.append(Paragraph("Product Requirements Document", title_style))
story.append(Spacer(1, 4 * mm))
story.append(Paragraph(
    "A tour and trek booking platform for the Indian market, with a private social "
    "and trip-planning layer &mdash; My Socials &mdash; for people who travel together.",
    subtitle_style))
story.append(Spacer(1, 28 * mm))
meta_label_style = ParagraphStyle("MetaLabel", fontName="Helvetica-Bold", fontSize=9.5, textColor=MUTED)
meta_value_style = ParagraphStyle("MetaValue", fontName="Helvetica", fontSize=9.5, textColor=INK)
meta_table = Table(
    [
        [Paragraph("Document", meta_label_style), Paragraph("Product Requirements Document (PRD)", meta_value_style)],
        [Paragraph("Product", meta_label_style), Paragraph("Travel, Together &mdash; tour &amp; trek booking platform", meta_value_style)],
        [Paragraph("Feature focus", meta_label_style), Paragraph("My Socials (social, planning, budgeting &amp; expense-splitting layer)", meta_value_style)],
        [Paragraph("Status", meta_label_style), Paragraph("Draft for review", meta_value_style)],
        [Paragraph("Audience", meta_label_style), Paragraph("Founders, designers, engineers", meta_value_style)],
    ],
    colWidths=[38 * mm, 118 * mm],
)
meta_table.setStyle(TableStyle([
    ("LINEBELOW", (0, 0), (-1, -2), 0.4, BORDER),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
]))
story.append(meta_table)
story.append(NextPageTemplate("BodyPage"))
story.append(PageBreak())

# ---------------------------------------------------------------- 1. PROBLEM
story.append(Paragraph("1. Problem", h1_style))
story.append(P(
    "Planning a group trip means juggling several disconnected tools: a chat app to decide where and "
    "when, a spreadsheet for the budget, a note to track who paid what, and a separate booking site to "
    "actually pay. The group repeats the same conversations, the total cost and each person's share "
    "stay unclear until someone does the maths by hand, and settling up afterwards becomes its own "
    "chore. The work of deciding, planning, booking and chasing payments falls on one person by default."
))
story.append(Paragraph("Who faces it", h2_style))
story.append(P(
    "The group organiser &mdash; a friend, family member, or the most organised person in a couple, "
    "student group or small community &mdash; who plans, books and follows up on money for everyone else."
))
story.append(Paragraph("Pain points", h2_style))
story.append(bullets([
    "Trip information is scattered across a messaging app, a spreadsheet and a booking site, with no single place the group can point to.",
    "Deciding on a destination and dates takes many back-and-forth messages with no shared view of options, cost or who has agreed to what.",
    "The total trip cost and each person's share stay unclear until someone totals it up by hand, often after the trip.",
    "The organiser pays upfront, then individually chases each member for their share, with no simple record of who owes what.",
    "There is no single place to see group membership, the shared plan, the budget and the booking status together.",
]))

# ---------------------------------------------------------------- 2. USER
story.append(Paragraph("2. User", h1_style))
story.append(Paragraph("Primary: the group trip organiser", h2_style))
story.append(P(
    "Age to be validated; typically plans for a group of 3&ndash;10 (friends, family, couples, a student "
    "group or small community). Goals: agree on a destination quickly, know the real cost before "
    "booking, book once for the group, and get paid back without chasing anyone. Already uses a chat "
    "app and a spreadsheet; wants those replaced by one connected place."
))
story.append(Paragraph("Secondary: invited friends/family, couples, seniors, solo travellers", h2_style))
story.append(P(
    "Invited members discuss, agree and pay their share without necessarily booking. Senior and solo "
    "travellers must be able to search, calculate and book fully without ever joining a group."
))
story.append(Paragraph("Internal: admin / operations", h2_style))
story.append(P("Maintain tour inventory, pricing and tax rules; every change must be traceable."))
story.append(Paragraph("User stories", h2_style))
story.append(bullets([
    "As an organiser, I want to create a named group for the trip so everyone has one shared place to plan it.",
    "As a member, I want to discuss destinations and share tour packages in the group chat so we decide together without switching apps.",
    "As an organiser, I want to calculate the estimated cost per category and per person before booking so the group can agree on a real budget.",
    "As a member, I want to add an expense and choose how it's split so shared spending is tracked accurately.",
    "As a member, I want a simple “who owes whom” summary so I don't have to do the maths myself.",
    "As an organiser, I want to book through the same price shown in the calculator so there are no surprises at checkout.",
    "As a member, I want to see booking and payment status without seeing other members' private traveller details.",
], space_after=2))

# ---------------------------------------------------------------- 3. SOLUTION
story.append(Paragraph("3. Solution", h1_style))
story.append(P(
    "Travel, Together joins tour discovery and booking with group planning in one platform. A group "
    "finds and compares tours, forms a trip group, discusses and decides in a group chat built for "
    "travel (not a generic messaging clone), calculates the real cost before committing, books through "
    "one consistent price, and splits shared expenses afterwards &mdash; without leaving the platform."
))
story.append(bullets([
    "Scattered information &rarr; one shared trip group: members, discussion, shared tour packages, budget and booking status in one connected view.",
    "Hard to decide together &rarr; a group chat built for travel, where sharing a tour package, link or photo is a first-class action.",
    "Unclear total and per-person cost &rarr; a Trip Budget Calculator with a category breakdown that saves into the group so everyone sees the same numbers.",
    "One person chasing money &rarr; Split Expenses, with equal or custom shares and a plain-English “who owes whom” summary.",
], space_after=2))
story.append(Paragraph("Two rules that hold the product together", h2_style))
story.append(bullets([
    "One pricing source: the tour page, calculator, checkout and invoice show the identical price for identical inputs.",
    "Booking total vs. shared expenses are different things, modelled separately: the booking total is what the platform charges; shared expenses are costs the group tracks among themselves. Group membership, booking travellers, who has paid, and who shares a given expense are four separate records &mdash; joining a group never makes someone a booking traveller.",
], space_after=2))

# ---------------------------------------------------------------- 4. FLOWS
story.append(Paragraph("4. User Flows", h1_style))
flows = [
    ("Discover", "Search by destination, dates, budget &rarr; filter &rarr; compare tours &rarr; open a tour page"),
    ("Understand cost", "Open Trip Budget Calculator &rarr; enter travellers &amp; days &rarr; see total, per-person cost, category breakdown"),
    ("Connect &amp; form a group", "Search for a friend &rarr; send request &rarr; friend accepts &rarr; create a named trip group &rarr; add friends"),
    ("Discuss and decide", "Open group chat &rarr; share tour packages, links, images &rarr; discuss dates/destination &rarr; agree on a tour"),
    ("Plan budget", "Open calculator from the group &rarr; enter category amounts &rarr; save to group &rarr; all members see the same total"),
    ("Book", "Organiser opens checkout on the agreed tour &rarr; reviews the calculator's price &rarr; completes mocked payment &rarr; confirmed"),
    ("Split expenses &amp; settle", "Add expense (name, amount, payer, participants, split) &rarr; view who-owes-whom &rarr; mark settlement paid"),
    ("Manage booking", "Open My Account &rarr; view booking tracker &rarr; members see status only; booker alone sees invoice &amp; documents"),
    ("Admin price/tax update", "Admin updates GST/TCS or a rate &rarr; change is logged &rarr; tour page, calculator, checkout, invoice all reflect it"),
]
story.append(make_table(["Flow", "Steps"], flows, [34 * mm, 128 * mm]))

# ---------------------------------------------------------------- 5. FEATURES
story.append(Paragraph("5. Features", h1_style))
building = [
    "Search, filters, tour comparison, tour pages (itinerary, departures, seats)",
    "Trip Budget Calculator: category breakdown, save-to-group",
    "One pricing source across tour page, calculator, checkout, invoice",
    "Mocked online booking and My Account booking tracker",
    "Friend connections: search, send/accept/reject requests, view profile",
    "One-to-one text chat, persisted",
    "Trip groups: create, name, invite/add members, view membership",
    "Group text chat with shared images, links and tour packages",
    "Split Expenses: add/edit/delete own, equal or custom split, who-owes-whom, mark settled",
    "My Socials dashboard and connected in-group view (members, chat, budget, expenses, booking in one place)",
    "Empty, loading and error states; English and Hindi",
]
not_building = [
    "Voice or video calls",
    "Public feed, followers, likes",
    "Influencer or creator marketplace",
    "Bank or transaction-account imports for expenses",
    "Guaranteed real-time chat delivery (see Open Decisions)",
    "Individual per-member payment at checkout (see Open Decisions)",
    "Any real payment, OTP or notification provider (mocked)",
]
max_len = max(len(building), len(not_building))
building += [""] * (max_len - len(building))
not_building += [""] * (max_len - len(not_building))
story.append(make_table(["Building in MVP", "Not building in MVP"], list(zip(building, not_building)), [81 * mm, 81 * mm]))
story.append(Spacer(1, 4))
story.append(Paragraph("My Socials capability &rarr; MVP behaviour", h2_style))
cap_rows = [
    ("My Friends", "Search users, send/accept/reject friend requests, view a friend's profile"),
    ("Messages", "One-to-one text chat; persists across sessions"),
    ("My Groups", "Create a named trip group, add/invite members, view participation"),
    ("Group Discussions", "Group text chat with shared images, links and tour packages/itineraries"),
    ("Trip Budget Calculator", "Category-based estimate, saved into the group for all members to see"),
    ("Split Expenses", "Add/edit/delete expenses, equal or custom split, who-owes-whom, mark settled"),
    ("Upcoming Group Trips", "List of groups with an agreed tour and booking status"),
]
story.append(make_table(["Capability", "MVP behaviour"], cap_rows, [38 * mm, 124 * mm]))
story.append(Spacer(1, 3))
story.append(Paragraph(
    "Scope note: one working end-to-end journey &mdash; discover, decide as a group, calculate, book, "
    "and split expenses &mdash; is worth more at this stage than many partially-built features.",
    body_italic
))

# ---------------------------------------------------------------- 6. DATA
story.append(Paragraph("6. Data Requirements", h1_style))
data_rows = [
    ("Tours", "Itinerary, departures, seats, inclusions, pricing inputs"),
    ("Pricing", "Rate rules, GST/TCS, the single calculated price used everywhere"),
    ("Users / Travellers", "Account profile; booking traveller details kept separate from the social profile"),
    ("Friend connections", "Requests, acceptance/rejection status, friendship links"),
    ("Groups", "Name, members, roles, linked tour (if agreed)"),
    ("Messages", "Text, shared links/images/tour packages, sender, timestamp, thread (1:1 or group)"),
    ("Budgets", "Category amounts, estimate vs. actual, who entered it, which group it's saved to"),
    ("Expenses", "Description, amount, payer, participants, split method, per-person shares, settlement status, timestamps"),
    ("Bookings", "Booking total, status, travellers named on the booking, payment record, linked group (if any)"),
    ("Transactions / Documents", "Invoice, traveller documents &mdash; visible only to the person who booked"),
    ("Admin / Audit", "Who changed a price or tax rule, when, old value, new value"),
]
story.append(make_table(["Data group", "What we store"], data_rows, [38 * mm, 124 * mm]))
story.append(Spacer(1, 4))
story.append(Paragraph("Data protection and trust", h2_style))
story.append(bullets([
    "Collect only what a feature needs; never collect Aadhaar numbers.",
    "Passport and PAN are collected only where a specific booking or legal process requires them, and are never shown to the group.",
    "Consent is asked before a profile or trip detail is shared with group members.",
    "Private traveller details (age, documents, payment method) are hidden by default and visible only to the person who booked.",
], space_after=2))

# ---------------------------------------------------------------- 7. SUCCESS
story.append(Paragraph("7. Success Check", h1_style))
story.append(Paragraph("Acceptance checks (pass/fail)", h2_style))
story.append(bullets([
    "A first-time visitor can search, calculate and book without any help and without being asked to join a group.",
    "A user can add a friend and create a group; an invited friend joins and sees the shared group information.",
    "Messages posted by any member appear in the group for all members.",
    "Budget totals, per-person cost and category percentages are mathematically correct (see test case below).",
    "Split calculations (shares and who-owes-whom) are correct (see test case below).",
    "The tour page, calculator, checkout and invoice show the identical price for identical inputs.",
    "An admin price or tax change propagates to every one of those four places.",
], space_after=2))
story.append(Paragraph("Metrics (hypotheses, not proven benchmarks &mdash; to be validated in use)", h2_style))
metric_rows = [
    ("Calculator use", "30% of tour-page visitors use it"),
    ("Self-serve booking", "40% complete booking with no support contact"),
    ("Friend-invite rate / invite-to-join rate", "to be validated"),
    ("Groups created per active user", "to be validated"),
    ("Share of groups with at least one expense", "to be validated"),
    ("Calculation accuracy", "100% correct on defined test scenarios"),
    ("Booking completion (started &rarr; confirmed)", "to be validated"),
]
story.append(make_table(["Metric", "Initial target / signal"], metric_rows, [70 * mm, 92 * mm]))
story.append(Spacer(1, 4))
story.append(Paragraph("Worked test cases", h2_style))
story.append(P(
    "<b>Budget (4 travellers):</b> transport Rs. 8,000 + stay Rs. 12,000 + food Rs. 6,000 + "
    "activities Rs. 4,000 + misc Rs. 2,000 = Rs. 32,000 total, Rs. 8,000 per person. "
    "Category shares: transport 25%, stay 37.5%, food 18.75%, activities 12.5%, misc 6.25%."
))
story.append(P(
    "<b>Split (4 people, Rs. 10,000 total):</b> A paid Rs. 4,000, B paid Rs. 2,000, C paid "
    "Rs. 1,000, D paid Rs. 3,000. Fair share is Rs. 2,500 each. Net balances: A +Rs. 1,500, "
    "B -Rs. 500, C -Rs. 1,500, D +Rs. 500. Settlement: C pays A Rs. 1,500; B "
    "pays D Rs. 500."
))

# ---------------------------------------------------------------- 8. DEMO
story.append(Paragraph("8. Demo Plan", h1_style))
demo_rows = [
    ("1", "Search and compare two or three tours", "Discovery and comparison work"),
    ("2", "Run the Budget Calculator for a 4-person, 5-day Goa trip", "Cost is clear and category-correct before booking"),
    ("3", "Add a friend", "Friend connections work"),
    ("4", "Create group “Goa Weekend”, invite two friends", "Group creation and invitations work"),
    ("5", "Second user joins and posts in group chat", "Shared membership and discussion work live"),
    ("6", "Share a tour package in the chat", "Group chat is travel-specific, not generic messaging"),
    ("7", "Run the four-friend expense split example", "Who-owes-whom is calculated correctly"),
    ("8", "Complete mocked checkout on the agreed tour", "Booking uses the same price as the calculator"),
    ("9", "Admin updates a tax rate", "The change updates the total everywhere, instantly"),
]
story.append(make_table(["Step", "Demo action", "What it proves"], demo_rows, [12 * mm, 78 * mm, 72 * mm]))
story.append(Spacer(1, 4))
story.append(P(
    "Narration: “This is a family planning a Goa weekend. They compare tours, calculate what it will "
    "actually cost split four ways, and create a group to invite their friends &mdash; who join and start "
    "discussing right away. Once they agree, one person books at the exact price the calculator showed, "
    "and the group settles up afterwards with a simple who-owes-whom view, no spreadsheet required.”"
))

# ---------------------------------------------------------------- 9. OPEN DECISIONS
story.append(Paragraph("9. Open Decisions", h1_style))
story.append(bullets([
    "Real-time chat delivery vs. refresh-based messaging: not yet decided.",
    "Does the organiser pay for the whole group at checkout, or can members pay individually?",
    "Does Split Expenses cover only informal trip costs (food, transport, extras), or can it also record shares of the booking payment itself?",
    "Which providers are live vs. mocked at launch: payments, OTP, notifications.",
    "Launch inventory, tax rules and cancellation policies: to be finalised with operations.",
    "Friend discovery privacy: who can search for and find whom.",
], space_after=2))

doc.build(story)
print(f"Wrote {OUT_PATH}")
