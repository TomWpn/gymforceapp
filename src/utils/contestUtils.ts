export const formatContestEndDate = (
  endDate: Date,
  includeYear: boolean = false
): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (includeYear) {
    options.weekday = "short";
    options.year = "numeric";
  }

  return endDate.toLocaleDateString("en-US", options);
};

export const getDaysRemaining = (endDate: Date): number => {
  const now = new Date();
  const diffInMs = endDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
};

export const formatContestDuration = (
  endDate: Date,
  shortFormat: boolean = false
): string => {
  const daysRemaining = getDaysRemaining(endDate);
  const formattedEndDate = formatContestEndDate(endDate, !shortFormat);

  if (shortFormat) {
    return `${daysRemaining} days left • Ends ${formattedEndDate}`;
  }

  return `${daysRemaining} days remaining • Ends ${formattedEndDate}`;
};
