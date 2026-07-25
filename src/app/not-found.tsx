import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col"><SiteHeader /><PageContainer className="grid min-h-[60svh] place-items-center">
      <Card className="max-w-xl">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">404</p>
          <h1 className="mt-3 text-3xl font-semibold">아직 공개되지 않은 스튜디오 공간입니다.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            주소가 변경되었거나, 사람 검토를 마치지 않은 비공개 운영 화면일 수 있습니다.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">회사 피드로 돌아가기</Link>
          </Button>
        </CardContent>
      </Card>
    </PageContainer><SiteFooter /></div>
  );
}
