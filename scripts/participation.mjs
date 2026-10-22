/** Exact counts only. Never reconstruct No votaron from a rounded rate. */
export function validateCounts(
  { registered, voted, notVoted = null, nonSpecified = null },
  publishedRate,
  publishedNonSpecified = null,
  tolerance = 0.051,
) {
  for (const [key, n] of Object.entries({
    registered,
    voted,
    notVoted,
    nonSpecified,
  })) {
    if (n !== null && (!Number.isSafeInteger(n) || n < 0))
      throw new Error(`Conteo inválido: ${key}`);
  }
  if (
    registered <= 0 ||
    voted > registered ||
    (notVoted !== null && voted + notVoted > registered)
  )
    throw new Error("Universo de conteos inválido.");
  if (
    !Number.isFinite(publishedRate) ||
    publishedRate < 0 ||
    publishedRate > 100
  )
    throw new Error("Participación fuera de rango.");
  if (
    publishedNonSpecified !== null &&
    (!Number.isFinite(publishedNonSpecified) ||
      publishedNonSpecified < 0 ||
      publishedNonSpecified > 100)
  )
    throw new Error("No especificados fuera de rango.");
  if (
    notVoted !== null &&
    nonSpecified !== null &&
    voted + notVoted + nonSpecified !== registered
  )
    throw new Error("Los tres conteos no suman lista nominal.");
  const denominator = notVoted === null ? null : voted + notVoted;
  if (denominator === 0) throw new Error("Denominador de participación cero.");
  const calculatedRate =
    denominator === null ? null : (100 * voted) / denominator;
  if (
    calculatedRate !== null &&
    Math.abs(calculatedRate - publishedRate) > tolerance
  )
    throw new Error("Participación no coincide dentro del redondeo publicado.");
  const calculatedNonSpecified =
    nonSpecified === null ? null : (100 * nonSpecified) / registered;
  if (
    calculatedNonSpecified !== null &&
    publishedNonSpecified !== null &&
    Math.abs(calculatedNonSpecified - publishedNonSpecified) > tolerance
  )
    throw new Error("No especificados no coinciden con lista nominal.");
  return {
    denominator,
    calculatedRate,
    calculatedNonSpecified,
    arithmeticCheck: calculatedRate === null ? "not-checkable" : "passed",
  };
}

/** Compatibility of TWO rounded percentages, not an estimate of No votaron. */
export function validatePublishedRounding({registered,voted}, participationPct, nonSpecifiedPct, abstentionPct) {
  validateCounts({registered,voted},participationPct,nonSpecifiedPct);
  if(!Number.isFinite(abstentionPct)||abstentionPct<0||abstentionPct>100)throw new Error('Abstención inválida.');
  if(Math.abs(participationPct+abstentionPct-100)>0.100000001)throw new Error('Participación y abstención incompatibles.');
  // Source displays one decimal: each percentage represents a rounding interval.
  const halfUnit=0.05;
  const unspecifiedMin=Math.max(0,nonSpecifiedPct-halfUnit)/100;
  const unspecifiedMax=Math.min(100,nonSpecifiedPct+halfUnit)/100;
  const denominatorMax=registered*(1-unspecifiedMin);
  const denominatorMin=Math.max(voted,registered*(1-unspecifiedMax));
  if(denominatorMax<=0||denominatorMax<voted)throw new Error('Universo incompatible con los conteos.');
  const minPct=100*voted/denominatorMax;
  const maxPct=voted===0?0:100*voted/denominatorMin;
  if(Math.max(minPct,participationPct-halfUnit)>Math.min(maxPct,participationPct+halfUnit)+1e-9)throw new Error('Tasa incompatible con el intervalo de redondeo.');
  return {arithmeticCheck:'rounded-compatible',participationIntervalFromNonSpecified:{minPct,maxPct},publishedPrecisionDecimals:1,exactNoVotaronAvailable:false};
}
