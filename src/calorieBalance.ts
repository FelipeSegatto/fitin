// Food intake and exercise-adjusted balance are distinct indicators.
export function calorieBalance(target: number, consumed: number, activity: number) {
  return {
    foodBalance: target - consumed,
    netBalance: consumed - target - activity,
    foodExcess: Math.max(0, consumed - target),
  };
}
