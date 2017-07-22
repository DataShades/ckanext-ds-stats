from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, UnicodeText, Boolean, Integer
import ckan.model as model
import uuid

Base = declarative_base()
metadata = Base.metadata


class DsStatsCache(Base):
    __tablename__ = 'ds_stats_cache'
    id = Column(UnicodeText, primary_key=True)
    public_display = Column(Boolean, default=True)
    sysadmin_display = Column(Boolean, default=False)
    cache_timeout = Column(Integer, default=86400)


def create_table():
    metadata.create_all(model.meta.engine)


def update_table():
    model.Session.add(DsStatsCache(
        id=unicode(uuid.uuid4()),
        public_display=True,
        sysadmin_display=False,
        cache_timeout=86400
    ))
    model.Session.commit()
