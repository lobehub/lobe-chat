export var revesePlacement = function revesePlacement(placement) {
  switch (placement) {
    case 'bottom':
      {
        return 'top';
      }
    case 'top':
      {
        return 'bottom';
      }
    case 'right':
      {
        return 'left';
      }
    case 'left':
      {
        return 'right';
      }
  }
};