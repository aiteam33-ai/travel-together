// Real, destination-matched stock photos (Unsplash) for each tour — hand
// picked per destination, zero repeats across the whole catalogue. Keyed by
// exact tour title as it appears in prisma/seed.ts's TOURS array.
//
// Each entry is [hero, gallery1, gallery2, gallery3] — base Unsplash photo
// URLs (no query string; sizing params are appended where used).
export const TOUR_PHOTOS: Record<string, [string, string, string, string]> = {
  "Kerala Backwaters & Hills Family Escape": [
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
    "https://images.unsplash.com/photo-1772729315540-415f2db20d98",
    "https://images.unsplash.com/photo-1593693411515-c20261bcad6e",
    "https://images.unsplash.com/photo-1783068293579-ef1c7fe73eb9",
  ],
  "Char Dham Yatra by Road": [
    "https://images.unsplash.com/photo-1718383538535-49ff3dd8c550",
    "https://images.unsplash.com/photo-1729922141827-ba9163bfb884",
    "https://images.unsplash.com/photo-1706963336286-029a26cd7810",
    "https://images.unsplash.com/photo-1646153110989-a9a8f03314f3",
  ],
  "Rajasthan Royal Circuit": [
    "https://images.unsplash.com/photo-1661924326425-c14a6426d989",
    "https://images.unsplash.com/photo-1591946522651-90fbace43004",
    "https://images.unsplash.com/photo-1649075990681-7f5f594088ad",
    "https://images.unsplash.com/photo-1625069111882-7735b7b95721",
  ],
  "Goa Beaches & Heritage": [
    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2",
    "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3",
    "https://images.unsplash.com/photo-1582972236019-ea4af5ffe587",
    "https://images.unsplash.com/photo-1496566084516-c5b96fcbd5c8",
  ],
  "Kashmir Paradise": [
    "https://images.unsplash.com/photo-1621232082074-1a7750ecc557",
    "https://images.unsplash.com/photo-1646204894165-95ed03d988ad",
    "https://images.unsplash.com/photo-1609412489711-2f037d8f4c77",
    "https://images.unsplash.com/photo-1542003488933-7cfa7453807a",
  ],
  "Himachal Shimla-Manali Family Trip": [
    "https://images.unsplash.com/photo-1706696435436-200ba23cda35",
    "https://images.unsplash.com/photo-1643862811428-88c6af8e0617",
    "https://images.unsplash.com/photo-1752563123486-0722d1346f78",
    "https://images.unsplash.com/photo-1735736997313-813b59b67ab6",
  ],
  "Andaman Island Getaway": [
    "https://images.unsplash.com/photo-1586053226626-febc8817962f",
    "https://images.unsplash.com/photo-1731934223456-8bc1ab67b9e5",
    "https://images.unsplash.com/photo-1710791206881-76d2b7add7ed",
    "https://images.unsplash.com/photo-1710790980317-7bf33539f67f",
  ],
  "Golden Triangle Express": [
    "https://images.unsplash.com/photo-1564507592333-c60657eea523",
    "https://images.unsplash.com/photo-1783456309503-6d0bb120bb9c",
    "https://images.unsplash.com/photo-1762999823430-8a1aa4ffc1a4",
    "https://images.unsplash.com/photo-1585506942812-e72b29cef752",
  ],
  "Northeast Explorer — Meghalaya & Assam": [
    "https://images.unsplash.com/photo-1593813738953-fb3c93e0769d",
    "https://images.unsplash.com/photo-1686472886489-1d2d7e08ff9c",
    "https://images.unsplash.com/photo-1552978534-9d01e1f91517",
    "https://images.unsplash.com/photo-1521437620269-f477f5437820",
  ],
  "Ladakh Bike & Landscape Tour": [
    "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2",
    "https://images.unsplash.com/photo-1768728410263-9fa72c338a90",
    "https://images.unsplash.com/photo-1619837374214-f5b9eb80876d",
    "https://images.unsplash.com/photo-1773575133321-92249861395c",
  ],
  "Varanasi & Bodh Gaya Spiritual Trail": [
    "https://images.unsplash.com/photo-1571536802807-30451e3955d8",
    "https://images.unsplash.com/photo-1558184525-2218e8c34914",
    "https://images.unsplash.com/photo-1652396507015-74b259a6f58d",
    "https://images.unsplash.com/photo-1762006221494-9b860b54d745",
  ],
  "Jyotirlinga Yatra — Maharashtra Circuit": [
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
    "https://images.unsplash.com/photo-1566915682737-3e97a7eed93b",
    "https://images.unsplash.com/photo-1711547979445-a72c87dfd004",
    "https://images.unsplash.com/photo-1604158155958-70cc7876d613",
  ],
  "Amarnath Yatra — Guided Group Departure": [
    "https://images.unsplash.com/photo-1622639127144-4433f28299bd",
    "https://images.unsplash.com/photo-1627894485229-ff2c619723e4",
    "https://images.unsplash.com/photo-1627894485200-b92fb4353967",
    "https://images.unsplash.com/photo-1763377357862-973fbc551db4",
  ],
  "Everest Base Camp Trek": [
    "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0",
    "https://images.unsplash.com/photo-1676471049029-f93852da351d",
    "https://images.unsplash.com/photo-1575819719798-83d97dd6949c",
    "https://images.unsplash.com/photo-1637846959991-18e54d6e2035",
  ],
  "Kedarkantha Winter Trek": [
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606",
    "https://images.unsplash.com/photo-1697012511676-674067ec0aa9",
    "https://images.unsplash.com/photo-1684436249636-c745f65f31eb",
    "https://images.unsplash.com/photo-1551932733-22b68c904545",
  ],
  "Valley of Flowers & Hemkund Trek": [
    "https://images.unsplash.com/photo-1662717402764-7b369f075261",
    "https://images.unsplash.com/photo-1685256575386-fb1ab26c2388",
    "https://images.unsplash.com/photo-1742107939923-e0f4f5ad6829",
    "https://images.unsplash.com/photo-1649421042256-ba4a2c9286d1",
  ],
  "Singapore-Malaysia Family Holiday": [
    "https://images.unsplash.com/photo-1508964942454-1a56651d54ac",
    "https://images.unsplash.com/photo-1774083599657-aa87510aa87b",
    "https://images.unsplash.com/photo-1496939376851-89342e90adcd",
    "https://images.unsplash.com/photo-1783142980713-abee43ecf5c9",
  ],
  "Thailand Bangkok-Phuket Beach Break": [
    "https://images.unsplash.com/photo-1551418843-01c6b62e864d",
    "https://images.unsplash.com/photo-1708656705549-14bcdf9b4921",
    "https://images.unsplash.com/photo-1737515994519-37d83e469902",
    "https://images.unsplash.com/photo-1737515908817-2b7668aea1a1",
  ],
  "Dubai-Abu Dhabi Desert & City": [
    "https://images.unsplash.com/photo-1518684079-3c830dcef090",
    "https://images.unsplash.com/photo-1528702748617-c64d49f918af",
    "https://images.unsplash.com/photo-1506645728556-ac574e628eca",
    "https://images.unsplash.com/photo-1763535539149-53eddcfa20dd",
  ],
  "Bali Honeymoon Special": [
    "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f",
    "https://images.unsplash.com/photo-1766854269605-bd06cb72217e",
    "https://images.unsplash.com/photo-1604999333679-b86d54738315",
    "https://images.unsplash.com/photo-1774960693655-33ca35130bbd",
  ],
  "Switzerland-France Alps & Paris": [
    "https://images.unsplash.com/photo-1521292270410-a8c4d716d518",
    "https://images.unsplash.com/photo-1530638458177-fcc275860f8b",
    "https://images.unsplash.com/photo-1758066277744-2f81d4ce8e1c",
    "https://images.unsplash.com/photo-1778975367580-6be80c77443a",
  ],
  "Women-Only Himachal Wellness Retreat": [
    "https://images.unsplash.com/photo-1758797316165-986ec92e7ad2",
    "https://images.unsplash.com/photo-1778484179081-448709a16e75",
    "https://images.unsplash.com/photo-1776150340216-c578e1df8eed",
    "https://images.unsplash.com/photo-1661188671366-f944d823b8ab",
  ],
  "Women-Only Vietnam Explorer": [
    "https://images.unsplash.com/photo-1528127269322-539801943592",
    "https://images.unsplash.com/photo-1780468126178-3d65e71c8b2c",
    "https://images.unsplash.com/photo-1771132666487-3d7a048a36df",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482",
  ],
  "South India Temple Trail — Tamil Nadu": [
    "https://images.unsplash.com/photo-1721532865054-5da685de394c",
    "https://images.unsplash.com/photo-1676465997765-4e37e9da8cde",
    "https://images.unsplash.com/photo-1759134334610-488eb3937c82",
    "https://images.unsplash.com/photo-1679214803434-af50c2c92009",
  ],
  "Spiti Valley Offbeat Expedition": [
    "https://images.unsplash.com/photo-1653844573020-71f77a0ccb8c",
    "https://images.unsplash.com/photo-1628782379401-4fff9cdcbbfe",
    "https://images.unsplash.com/photo-1623229136063-5a4dd883401b",
    "https://images.unsplash.com/photo-1637314995939-7560a94b1495",
  ],
};

export function tourPhotoUrl(baseUrl: string, width = 800, height = 500): string {
  return `${baseUrl}?auto=format&fit=crop&w=${width}&h=${height}&q=70`;
}
