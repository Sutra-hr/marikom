import styled, { keyframes } from "styled-components";

export const WrapAll = styled.section`
  box-sizing: border-box;
  position: relative;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 140px 40px 100px 40px;
  color: #1c2640;
  font-family: "Gilroy", sans-serif;
  scroll-margin-top: 80px;
  @media only screen and (max-width: 750px) {
    padding: 110px 16px 50px 16px;
  }
`;

export const BlueLine = styled.div`
  width: 85px;
  height: 3px;
  background-color: #4299c8;
  margin: 0 auto 25px auto;
`;

export const Naslov = styled.h2`
  margin: 0 0 40px 0;
  text-align: center;
  font-family: "Roboto Condensed", sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 110%;
  @media only screen and (max-width: 750px) {
    font-size: 30px;
    margin-bottom: 25px;
  }
`;

export const Info = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
`;

export const InfoText = styled.div`
  font-size: 15px;
  line-height: 150%;
  strong {
    font-weight: 600;
  }
`;

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  label {
    display: flex;
    flex-direction: column;
    font-size: 13px;
    gap: 4px;
  }
  select,
  input {
    height: 45px;
    border: 1px solid #c9d3e0;
    border-radius: 6px;
    padding: 0 12px;
    font-family: inherit;
    font-size: 15px;
    color: #1c2640;
    background: #fff;
    max-width: 100%;
  }
  @media only screen and (max-width: 750px) {
    width: 100%;
    label,
    select,
    input {
      width: 100%;
    }
  }
`;

export const DownloadButton = styled.a`
  height: 45px;
  padding: 0 22px;
  border-radius: 6px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: #4299c8;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  @media only screen and (max-width: 750px) {
    width: 100%;
  }
`;

export const TableWrap = styled.div`
  @media only screen and (max-width: 750px) {
    display: none;
  }
  width: 100%;
  max-height: 600px;
  overflow: auto;
  border: 1px solid #e3e8ef;
  border-radius: 6px;
  -webkit-overflow-scrolling: touch;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eef1f5;
    vertical-align: top;
  }
  th {
    position: sticky;
    top: 0;
    background: #1c2640;
    color: #fff;
    font-weight: 500;
    white-space: nowrap;
  }
  td.num,
  th.num {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  td.sidrena {
    font-weight: 600;
  }
  td.sidrena small {
    display: block;
    font-size: 11px;
    font-weight: 400;
    opacity: 0.65;
  }
  tbody tr:nth-child(even) {
    background: #f7f9fb;
  }
`;

export const Uvod = styled.p`
  max-width: 760px;
  margin: -20px auto 40px auto;
  text-align: center;
  font-size: 16px;
  line-height: 150%;
  @media only screen and (max-width: 750px) {
    margin: -10px auto 25px auto;
    font-size: 15px;
  }
`;

export const Napomena = styled.p`
  margin: 16px 0 0 0;
  font-size: 13px;
  opacity: 0.75;
`;

export const Poruka = styled.p`
  text-align: center;
  font-size: 16px;
  padding: 30px 0;
`;

export const Filteri = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px 16px;
  margin-bottom: 12px;
`;

export const Checkbox = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  cursor: pointer;
  input {
    width: 18px;
    height: 18px;
    accent-color: #4299c8;
    cursor: pointer;
  }
`;

export const Broj = styled.div`
  font-size: 13px;
  opacity: 0.75;
`;

export const Oznaka = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  background: ${(p) => (p.$akcija ? "#fdecd2" : p.$nedostupno ? "#eef1f5" : "#e2f3ea")};
  color: ${(p) => (p.$akcija ? "#8a4b00" : p.$nedostupno ? "#5b6577" : "#1d6b3f")};
`;

export const Kartice = styled.div`
  display: none;
  @media only screen and (max-width: 750px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

export const Kartica = styled.div`
  border: 1px solid #e3e8ef;
  border-radius: 8px;
  padding: 14px;
  background: #fff;
  opacity: ${(p) => (p.$nedostupno ? 0.7 : 1)};
  .vrh {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .naziv {
    font-weight: 600;
    font-size: 15px;
    line-height: 1.3;
  }
  .marka {
    font-size: 13px;
    opacity: 0.7;
    margin-top: 2px;
  }
  .sidrena {
    text-align: right;
    font-weight: 700;
    font-size: 18px;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
    span {
      display: block;
      font-size: 11px;
      font-weight: 400;
      opacity: 0.7;
    }
  }
  dl {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 20px;
    margin: 10px 0 0 0;
    font-size: 13px;
    div {
      display: flex;
      gap: 6px;
    }
    dt {
      opacity: 0.7;
    }
    dd {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
  }
  .oznake {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
`;

const vrtnja = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const puls = keyframes`
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
`;

export const Loader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 30px 0;
  font-size: 15px;
  color: #1c2640;
  &::before {
    content: "";
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border: 3px solid #d6e7f2;
    border-top-color: #4299c8;
    animation: ${vrtnja} 0.8s linear infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    &::before {
      animation-duration: 2.4s;
    }
  }
`;

export const Kostur = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  div {
    height: 38px;
    border-radius: 6px;
    background: #eef1f5;
    animation: ${puls} 1.4s ease-in-out infinite;
  }
  div:nth-child(1) {
    background: #dfe5ee;
  }
  @media (prefers-reduced-motion: reduce) {
    div {
      animation: none;
    }
  }
`;
