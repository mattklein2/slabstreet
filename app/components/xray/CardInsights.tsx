// app/components/xray/CardInsights.tsx
'use client';

import { useTheme } from '../ThemeProvider';
import type { CardIdentity, MatchedParallel, MatchedProduct, RainbowEntry, MatchedCardSet } from '../../../lib/xray/types';

interface Insight {
  label: string;
  text: string;
  color?: string; // override text color
}

interface Props {
  identity: CardIdentity;
  product: MatchedProduct | null;
  matchedParallel: MatchedParallel | null;
  matchedCardSet: MatchedCardSet | null;
  rainbow: RainbowEntry[];
  education: {
    setDescription: string | null;
    parallelDescription: string | null;
    flagshipContext: string | null;
    insertDescription: string | null;
  };
}

export function CardInsights({ identity, product, matchedParallel, matchedCardSet, rainbow, education }: Props) {
  const { colors } = useTheme();

  const insights = generateInsights(identity, product, matchedParallel, matchedCardSet, rainbow, education);

  if (insights.length === 0) return null;

  return (
    <section style={{
      background: colors.surface,
      borderRadius: 14,
      padding: 24,
      marginBottom: 16,
    }}>
      <h2 style={{
        margin: '0 0 16px',
        fontSize: 14,
        fontFamily: "'IBM Plex Mono', monospace",
        fontWeight: 600,
        letterSpacing: 1,
        color: colors.green,
        textTransform: 'uppercase',
      }}>
        Card Insights
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        {insights.map((insight, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            <div style={{
              flexShrink: 0,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: insight.color || colors.green,
              marginTop: 7,
            }} />
            <div>
              <span style={{
                fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 600,
                color: insight.color || colors.green,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {insight.label}
              </span>
              <p style={{
                margin: '4px 0 0',
                fontSize: 14,
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: colors.secondary,
                lineHeight: 1.5,
              }}>
                {insight.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function generateInsights(
  identity: CardIdentity,
  product: MatchedProduct | null,
  matchedParallel: MatchedParallel | null,
  matchedCardSet: MatchedCardSet | null,
  rainbow: RainbowEntry[],
  education: { setDescription: string | null; parallelDescription: string | null; flagshipContext: string | null; insertDescription: string | null },
): Insight[] {
  const insights: Insight[] = [];

  // Hall of Fame detection from the listing title
  const titleLower = identity.raw.title.toLowerCase();
  const isHOF = /\bhof\b|hall\s*of\s*fam/i.test(titleLower);

  // Player context
  if (identity.player) {
    if (isHOF) {
      insights.push({
        label: 'Hall of Famer',
        text: `${identity.player} is a Hall of Fame player. HOF cards tend to hold long-term value and have a strong collector base that spans generations.`,
        color: '#FFD700',
      });
    }
  }

  // Autograph
  if (identity.isAutographed) {
    insights.push({
      label: 'Autographed',
      text: `This card has an autograph${identity.player ? ` from ${identity.player}` : ''}. Authenticated autograph cards are among the most sought-after in the hobby, especially on-card signatures (signed directly on the card rather than a sticker).`,
    });
  }

  // Grading
  if (identity.isGraded && identity.grader && identity.grade) {
    const gradeNum = parseFloat(identity.grade);
    const graderName = identity.grader;
    let gradeContext = '';

    if (graderName === 'PSA') {
      if (gradeNum === 10) gradeContext = 'PSA 10 (Gem Mint) is the highest standard grade — less than 1 in 4 submissions earn a 10. This grade confirms the card is in virtually perfect condition and authenticates it as genuine.';
      else if (gradeNum === 9) gradeContext = 'PSA 9 (Mint) is an excellent grade indicating near-perfect condition. These are strong collectibles at a fraction of PSA 10 pricing.';
      else if (gradeNum >= 7) gradeContext = `PSA ${identity.grade} indicates a well-preserved card. Grading also authenticates the card as genuine, which matters for high-value cards.`;
      else gradeContext = `PSA ${identity.grade} is a lower grade, often reflecting visible wear. The slab still authenticates the card as genuine.`;
    } else if (graderName === 'BGS') {
      if (gradeNum >= 9.5) gradeContext = `BGS ${identity.grade} (${gradeNum === 10 ? 'Pristine' : 'Gem Mint'}) is an elite grade. BGS uses sub-grades for centering, corners, edges, and surface — making their top grades especially hard to achieve.`;
      else gradeContext = `BGS ${identity.grade} — Beckett grades on four sub-categories (centering, corners, edges, surface) for a more detailed condition assessment.`;
    } else if (graderName === 'SGC') {
      if (gradeNum >= 9.5) gradeContext = `SGC ${identity.grade} is a top-tier grade. SGC is known for strict, consistent grading and is especially respected for vintage cards.`;
      else gradeContext = `SGC ${identity.grade} — SGC is a respected grading company known for consistency. The slab authenticates and protects the card.`;
    } else {
      gradeContext = `${graderName} ${identity.grade} — this card has been professionally graded, which authenticates it and provides a standardized condition assessment.`;
    }

    insights.push({
      label: 'Graded',
      text: gradeContext,
    });
  }

  // Rookie
  if (identity.isRookie) {
    insights.push({
      label: 'Rookie Card',
      text: `${identity.player ? `This is ${identity.player}'s` : "This is a"} rookie card. Rookie cards are typically the most valuable year for any player — they represent the first officially licensed cards from a player's debut season.`,
    });
  }

  // Parallel rarity
  if (matchedParallel) {
    const printRunText = matchedParallel.printRun
      ? `limited to ${matchedParallel.printRun === 1 ? 'just 1 copy (a true one-of-one)' : `only ${matchedParallel.printRun} copies`}`
      : matchedParallel.isOneOfOne ? 'a true one-of-one (only 1 exists)' : null;

    const totalParallels = rainbow.length;
    const currentRank = matchedParallel.rarityRank;
    const tierText = currentRank <= Math.ceil(totalParallels * 0.15) ? 'one of the rarest parallels'
      : currentRank <= Math.ceil(totalParallels * 0.4) ? 'an uncommon parallel'
      : 'a common parallel';

    let text = `${matchedParallel.parallelName} is ${tierText} in this set`;
    if (totalParallels > 1) text += ` (${totalParallels} total parallels)`;
    if (printRunText) text += `, ${printRunText}`;
    text += '. Parallels are alternate versions of the base card with different colors, textures, or finishes — lower print runs are harder to find and more collectible.';

    insights.push({
      label: 'Parallel',
      text,
    });
  } else if (identity.parallel) {
    insights.push({
      label: 'Parallel',
      text: `This appears to be a ${identity.parallel} parallel. Parallels are alternate versions of the base card with different colors, textures, or finishes.`,
    });
  }

  // Insert set
  if (matchedCardSet?.type === 'insert' || matchedCardSet?.type === 'subset') {
    let text = `${matchedCardSet.cardSetName} is an insert set`;
    if (matchedCardSet.odds) text += ` found at ${matchedCardSet.odds}`;
    text += '. Insert cards are special chase cards randomly inserted into packs — they feature unique designs separate from the base set.';
    if (matchedCardSet.description) text += ` ${matchedCardSet.description}`;

    insights.push({
      label: 'Insert',
      text,
    });
  }

  // Set/product context
  if (product) {
    let text = '';
    if (education.flagshipContext) {
      text = education.flagshipContext;
    }
    if (education.setDescription) {
      text += (text ? ' ' : '') + education.setDescription;
    }
    if (text) {
      insights.push({
        label: 'The Set',
        text,
      });
    }
  }

  return insights;
}
