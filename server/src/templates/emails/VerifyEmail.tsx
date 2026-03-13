import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button
} from "@react-email/components";

interface VerifyEmailProps {
  name: string;
  verifyUrl: string;
}

export function VerifyEmail({ name, verifyUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container>
          <Text>Hello {name},</Text>
          <Text>Please verify your email address:</Text>
          <Button href={verifyUrl}>Verify Email</Button>
        </Container>
      </Body>
    </Html>
  );
}
