export const timeConverter = (time: string) => {
    switch (time) {
      case "1H":
        return 1;
      case "24H":
        return 1;
      case "1W":
        return 7;
      case "1M":
        return 30;
      case "1Y":
        return 365;
      default:
        return 1;
    }
  };
