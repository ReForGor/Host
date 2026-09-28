from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from backend.features.products.models import Product, Store, PriceListing
from backend.features.alerts.models import PriceAlert, Notification
from backend.features.auth.models import User

async def get_admin_dashboard_stats(db: AsyncSession):
    prod_count = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    store_count = (await db.execute(select(func.count(Store.id)))).scalar() or 0
    listing_count = (await db.execute(select(func.count(PriceListing.id)))).scalar() or 0
    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    alert_count = (await db.execute(select(func.count(PriceAlert.id)))).scalar() or 0
    notif_count = (await db.execute(select(func.count(Notification.id)))).scalar() or 0

    notifs_res = await db.execute(
        select(Notification).order_by(desc(Notification.created_at)).limit(5)
    )
    recent_notifs = notifs_res.scalars().all()

    stores_res = await db.execute(select(Store))
    stores = stores_res.scalars().all()
    stores_data = []
    for s in stores:
        cnt = (await db.execute(
            select(func.count(PriceListing.id)).where(PriceListing.store_id == s.id)
        )).scalar() or 0
        stores_data.append({
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "color": s.color or "#06b6d4",
            "is_active": s.is_active,
            "listings_count": cnt
        })

    return {
        "products_count": prod_count,
        "stores_count": store_count,
        "listings_count": listing_count,
        "users_count": user_count,
        "alerts_count": alert_count,
        "notifications_count": notif_count,
        "stores": stores_data,
        "recent_notifications": [
            {
                "id": n.id,
                "title": n.title,
                "store_name": n.store_name,
                "new_price": n.new_price,
                "created_at": n.created_at
            }
            for n in recent_notifs
        ]
    }
