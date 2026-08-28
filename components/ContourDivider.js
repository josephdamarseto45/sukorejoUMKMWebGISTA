// Elemen dekoratif khas halaman ini: garis kontur berundak yang meniru
// sawah terasering Sukorejo, dipakai sebagai pemisah antar-section
// menggantikan garis pembatas generik.
export default function ContourDivider({ flip = false, tone = "light" }) {
  const stroke = tone === "dark" ? "#F1EEDF" : "#2F4A3C";
  return (
    <svg
      className="contour-divider"
      viewBox="0 0 1200 48"
      preserveAspectRatio="none"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M0 36 C 100 20, 200 44, 300 28 S 500 12, 600 30 S 800 44, 900 24 S 1100 12, 1200 28"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.55"
        strokeWidth="1.5"
      />
      <path
        d="M0 44 C 120 30, 220 46, 340 34 S 560 20, 660 38 S 860 46, 980 30 S 1120 20, 1200 36"
        fill="none"
        stroke={stroke}
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
    </svg>
  );
}
