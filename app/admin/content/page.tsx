import {
  listCouponCodes,
  listFaqItems,
  listPolicyDocuments,
  listPromoBanners,
  listSeoPages,
} from "@/lib/content-management";
import {
  addPromoBannerAction,
  createCouponAction,
  createFaqAction,
  createSeoPageAction,
  toggleCouponAction,
  togglePromoBannerAction,
  toggleSeoPageAction,
  updatePolicyAction,
} from "./actions";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value);

export default async function ContentManagementPage() {
  const banners = await listPromoBanners();
  const coupons = await listCouponCodes();
  const seoPages = await listSeoPages();
  const faqs = await listFaqItems();
  const policies = await listPolicyDocuments();

  return (
    <main className="space-y-6">
      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(28,25,23,0.08)]">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500">
          Content management
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">
          Own every page that passengers land on
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Publish promo banners, coupon campaigns, marketing pages, FAQs, and policies directly from the admin console.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-6 shadow">
          <h2 className="text-xl font-semibold text-stone-900">Promo banners</h2>
          <p className="mt-1 text-xs text-stone-500">
            Keep CTA-rich hero content fresh; set priority so the highest impact banner runs first.
          </p>
          <form action={addPromoBannerAction} className="mt-4 grid gap-3 text-xs">
            <input
              name="title"
              required
              placeholder="Title"
              className="rounded-full border border-stone-200 bg-white px-3 py-2"
            />
            <input
              name="description"
              placeholder="Short description"
              className="rounded-full border border-stone-200 bg-white px-3 py-2"
            />
            <div className="flex flex-wrap gap-2">
              <input
                name="ctaLabel"
                required
                placeholder="CTA label"
                className="flex-1 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
              <input
                name="ctaLink"
                placeholder="CTA link"
                className="flex-1 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                name="imageUrl"
                placeholder="Image URL"
                className="flex-1 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
              <input
                name="priority"
                type="number"
                min={1}
                max={10}
                defaultValue={5}
                placeholder="Priority"
                className="w-24 rounded-full border border-stone-200 bg-white px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-200"
            >
              Save banner
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{banner.title}</p>
                    <p className="text-xs text-stone-500">Priority {banner.priority}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${
                      banner.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {banner.active ? "Active" : "Dormant"}
                  </span>
                </div>
                <p className="text-xs text-stone-500">{banner.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-stone-500">
                  <span className="rounded-full border border-stone-200 px-3 py-1">{banner.ctaLabel}</span>
                  <span className="rounded-full border border-stone-200 px-3 py-1">{banner.ctaLink || "No link"}</span>
                </div>
                <form action={togglePromoBannerAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={banner.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={banner.active ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.65rem] font-semibold text-stone-700"
                  >
                    {banner.active ? "Pause" : "Activate"}
                  </button>
                  <span className="text-[0.55rem] text-stone-400">ID {banner.id}</span>
                </form>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-stone-900">Coupon codes</h2>
          <p className="mt-1 text-xs text-stone-500">
            Publish campaigns, attach expiry dates, and pause codes when they run dry.
          </p>
          <form action={createCouponAction} className="mt-4 grid gap-3 text-xs">
            <input
              name="code"
              required
              placeholder="Code"
              className="rounded-full border border-stone-200 px-3 py-2"
            />
            <div className="flex flex-wrap gap-2">
              <select
                name="discountType"
                className="rounded-full border border-stone-200 px-3 py-2"
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat</option>
              </select>
              <input
                name="value"
                type="number"
                min={1}
                step={1}
                placeholder="Value"
                className="w-32 rounded-full border border-stone-200 px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                name="expiresAt"
                type="date"
                className="rounded-full border border-stone-200 px-3 py-2"
              />
              <input
                name="usageLimit"
                type="number"
                min={0}
                placeholder="Usage limit"
                className="w-32 rounded-full border border-stone-200 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900"
            >
              Create coupon
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col gap-2 rounded-2xl border border-stone-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{coupon.code}</p>
                    <p className="text-[0.65rem] text-stone-500">
                      {coupon.discountType === "percent"
                        ? `${coupon.value}% off`
                        : `$${coupon.value} flat`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${
                      coupon.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {coupon.active ? "Active" : "Paused"}
                  </span>
                </div>
                <p className="text-[0.65rem] text-stone-500">
                  Expires {formatDate(coupon.expiresAt)} • {coupon.usedCount}/{coupon.usageLimit} used
                </p>
                <form action={toggleCouponAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={coupon.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={coupon.active ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.65rem] font-semibold text-stone-700"
                  >
                    {coupon.active ? "Pause" : "Reactivate"}
                  </button>
                  <span className="text-[0.55rem] text-stone-400">ID {coupon.id}</span>
                </form>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-stone-900">SEO pages</h2>
          <p className="mt-1 text-xs text-stone-500">
            Draft marketing content, keep metadata fresh, and publish new landing pages for traffic.
          </p>
          <form action={createSeoPageAction} className="mt-4 grid gap-3 text-xs">
            <input
              name="slug"
              required
              placeholder="Slug"
              className="rounded-full border border-stone-200 px-3 py-2"
            />
            <input
              name="title"
              required
              placeholder="Page title"
              className="rounded-full border border-stone-200 px-3 py-2"
            />
            <input
              name="metaDescription"
              required
              placeholder="Meta description"
              className="rounded-full border border-stone-200 px-3 py-2"
            />
            <label className="flex items-center gap-2 text-xs">
              <input name="published" type="checkbox" value="true" />
              Publish immediately
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900"
            >
              Add page
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {seoPages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col gap-2 rounded-2xl border border-stone-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">/{page.slug}</p>
                    <p className="text-[0.65rem] text-stone-500">{page.title}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] ${
                      page.published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {page.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-[0.65rem] text-stone-500">{page.metaDescription}</p>
                <p className="text-[0.65rem] text-stone-400">Updated {formatDate(page.updatedAt)}</p>
                <form action={toggleSeoPageAction} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={page.id} />
                  <input
                    type="hidden"
                    name="published"
                    value={page.published ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-stone-200 px-3 py-1 text-[0.65rem] font-semibold text-stone-700"
                  >
                    {page.published ? "Unpublish" : "Publish"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[28px] border border-stone-200 bg-stone-50 p-6 shadow">
          <h2 className="text-xl font-semibold text-stone-900">FAQ pages</h2>
          <p className="mt-1 text-xs text-stone-500">
            Add topical help items that surface in the passenger support center.
          </p>
          <form action={createFaqAction} className="mt-4 grid gap-3 text-xs">
            <input
              name="question"
              required
              placeholder="Question"
              className="rounded-full border border-stone-200 bg-white px-3 py-2"
            />
            <textarea
              name="answer"
              required
              placeholder="Answer"
              rows={2}
              className="rounded-2xl border border-stone-200 bg-white px-3 py-2"
            />
            <input
              name="category"
              placeholder="Category"
              className="rounded-full border border-stone-200 bg-white px-3 py-2"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-4 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-200"
            >
              Add FAQ item
            </button>
          </form>
          <div className="mt-4 space-y-3 text-xs text-stone-600">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="flex flex-col gap-2 rounded-2xl border border-stone-100 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-900">{faq.question}</p>
                  <span className="text-[0.6rem] text-stone-400">{faq.category}</span>
                </div>
                <p className="text-[0.8rem] text-stone-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">Terms &amp; policies</h2>
          <p className="text-xs text-stone-500">
            Update summaries and full text that passengers review in the footer.
          </p>
        </div>
        <div className="mt-4 space-y-4 text-xs text-stone-600">
          {policies.map((policy) => (
            <form
              key={policy.id}
              action={updatePolicyAction}
              className="space-y-2 rounded-2xl border border-stone-100 p-4"
            >
              <input type="hidden" name="id" value={policy.id} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-stone-900">{policy.name}</p>
                <span className="text-[0.65rem] text-stone-500">
                  Last updated {formatDate(policy.lastUpdated)}
                </span>
              </div>
              <input
                name="summary"
                defaultValue={policy.summary}
                className="w-full rounded-full border border-stone-200 px-3 py-2"
              />
              <textarea
                name="content"
                defaultValue={policy.content}
                rows={3}
                className="w-full rounded-2xl border border-stone-200 px-3 py-2"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-stone-900 px-4 py-2 text-xs font-semibold text-stone-900"
              >
                Save policy
              </button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
