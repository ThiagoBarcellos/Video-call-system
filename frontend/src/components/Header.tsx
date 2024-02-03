import Image from "next/image";
import Container from "./Container";

export default function Header() {
  return (
    <div className="bg-gray-1000 p-4">
      <Container>
          <Image alt="Talk to Me!" src={"/logo.svg"} width={120} height={120} />
      </Container>
    </div>
  );
}
