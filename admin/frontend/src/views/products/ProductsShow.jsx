import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, ExternalLink, Star, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

export default function ProductsShow() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [savingQr, setSavingQr] = useState(false);

  const fetchProduct = () => {
    axiosClient.get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.data);
        setQrUrl(data.data.qr_url || "");
        setLoading(false);
      })
      .catch(() => {
        toast.error(t("common.error_occurred"));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [id, t]);

  const handleRegenerateQr = () => {
    setRegenerating(true);
    axiosClient.post(`/products/${id}/regenerate-qr`)
      .then(({ data }) => {
        setProduct(data.data);
        setQrUrl(data.data.qr_url || "");
        toast.success(t("products.qr_regenerated"));
      })
      .catch(() => {
        toast.error(t("common.error_occurred"));
      })
      .finally(() => {
        setRegenerating(false);
      });
  };

  const handleSaveQrUrl = () => {
    setSavingQr(true);
    axiosClient.patch(`/products/${id}/qr-url`, { qr_url: qrUrl })
      .then(({ data }) => {
        setProduct(data.data);
        toast.success(t("common.save_success"));
      })
      .catch(() => {
        toast.error(t("common.error_occurred"));
      })
      .finally(() => {
        setSavingQr(false);
      });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
  };

  if (loading) {
    return <div className="p-8 text-center">{t("common.loading")}</div>;
  }

  if (!product) {
    return <div className="p-8 text-center">{t("common.not_found")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.featured && (
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/products/edit/${product.id}`}>
              {t("common.edit")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("products.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.id")}
                </label>
                <p className="text-lg font-semibold">#{product.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.status")}
                </label>
                <p className="mt-1">
                  <Badge variant={product.status === "published" ? "default" : "secondary"}>
                    {t(`products.${product.status}`)}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.cost_price")}
                </label>
                <p className="text-lg font-semibold">${product.cost_price}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.sale_price")}
                </label>
                <p className="text-lg font-semibold">${product.sale_price}</p>
              </div>
            </div>

            {product.category && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.category")}
                </label>
                <p className="text-lg">{product.category.name}</p>
              </div>
            )}

            {product.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.description")}
                </label>
                <p className="mt-1 text-sm">{product.description}</p>
              </div>
            )}

            {product.cover_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("products.cover")}
                </label>
                <img
                  src={product.cover_url}
                  alt={product.name}
                  className="mt-2 h-48 w-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("products.qr_code")}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateQr}
              disabled={regenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? t("common.loading") : t("products.regenerate_qr")}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {product.qr_url ? (
              <>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <QRCodeSVG
                    value={qrUrl}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                </div>

                <div className="mt-4 w-full">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t("products.qr_url")}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={qrUrl}
                      onChange={(e) => setQrUrl(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSaveQrUrl}
                      disabled={savingQr}
                    >
                      {savingQr ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(qrUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a
                        href={qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">{t("products.no_qr_url")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
