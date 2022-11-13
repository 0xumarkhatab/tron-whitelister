export function getMinimalAddress(adr, shouldCare) {
    if (shouldCare && !adr) return "Fetching..";
    if(!adr) return ""; 
    return adr?.toString().slice(0, 6) + ".." + adr?.toString().slice(38);
  }
  