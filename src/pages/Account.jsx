import React, { useEffect, useState } from "react";
import Nav from "../components/Nav.jsx";
import Avatar from "../components/Avatar.jsx";
import { supabase } from "../lib/supabaseClient.js";

export default function Account({ user, role }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [realName, setRealName] = useState("");
  const [nicknames, setNicknames] = useState([]);
  const [displayChoice, setDisplayChoice] = useState("real_name"); // "real_name" 或某個暱稱字串
  const [igId, setIgId] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [newNickname, setNewNickname] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    supabase
      .from("profiles")
      .select("avatar_url, real_name, nicknames, display_name, ig_id, phone, contact_email")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("讀取個人資料失敗：", error);
        }
        if (data) {
          setAvatarUrl(data.avatar_url);
          setRealName(data.real_name ?? "");
          setNicknames(data.nicknames ?? []);
          setIgId(data.ig_id ?? "");
          setPhone(data.phone ?? "");
          setContactEmail(data.contact_email ?? user.email ?? "");
          setDisplayChoice(
            data.display_name && data.display_name !== data.real_name ? data.display_name : "real_name"
          );
        } else {
          setContactEmail(user.email ?? "");
        }
        setLoading(false);
      });
  }, [user]);

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);

    if (uploadError) {
      setError("大頭照上傳失敗：" + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    setUploading(false);
  }

  function addNickname() {
    const trimmed = newNickname.trim();
    if (!trimmed || nicknames.includes(trimmed)) return;
    setNicknames([...nicknames, trimmed]);
    setNewNickname("");
  }

  function removeNickname(nickname) {
    setNicknames(nicknames.filter((n) => n !== nickname));
    if (displayChoice === nickname) setDisplayChoice("real_name");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const finalDisplayName = displayChoice === "real_name" ? realName.trim() || null : displayChoice;

    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        real_name: realName.trim() || null,
        nicknames,
        display_name: finalDisplayName,
        ig_id: igId.trim() || null,
        phone: phone.trim() || null,
        contact_email: contactEmail.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      setError("儲存失敗：" + error.message);
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!user) {
    return (
      <div>
        <Nav user={user} role={role} />
        <section className="px-10 py-16">
          <p className="text-sm text-ash">請先登入才能維護個人資料。</p>
        </section>
      </div>
    );
  }

  return (
    <div>
      <Nav user={user} role={role} />
      <section className="px-10 py-16">
        <h1 className="font-display text-3xl font-medium mb-10">個人資料</h1>

        {loading ? (
          <p className="text-ash text-sm">載入中...</p>
        ) : (
          <form onSubmit={handleSave} className="max-w-lg flex flex-col gap-6">
            <div>
              <label className="block text-xs text-ash mb-2">大頭照</label>
              <div className="flex items-center gap-4">
                <Avatar url={avatarUrl} size={64} alt={realName} />
                <div>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="text-sm" />
                  {uploading && <p className="text-ash text-xs mt-1">上傳中...</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-ash mb-1">真名</label>
              <input
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="留空的話，其他人會看到「神秘客」"
                className="w-full border border-seam rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-ash mb-2">暱稱（可以新增多個，並選一個要顯示的）</label>
              <div className="flex flex-col gap-2 mb-3">
                {nicknames.map((n) => (
                  <div key={n} className="flex items-center gap-2">
                    <span className="text-sm border border-seam rounded px-3 py-2 flex-1">{n}</span>
                    <button
                      type="button"
                      onClick={() => removeNickname(n)}
                      className="text-xs text-ash px-3 py-2 border border-seam rounded"
                    >
                      移除
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addNickname();
                    }
                  }}
                  placeholder="輸入新暱稱"
                  className="flex-1 border border-seam rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addNickname}
                  className="text-sm px-4 py-2 rounded border border-seam"
                >
                  新增
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-ash mb-2">其他人看到的名字</label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="displayChoice"
                    checked={displayChoice === "real_name"}
                    onChange={() => setDisplayChoice("real_name")}
                  />
                  真名（{realName.trim() || "尚未填寫"}）
                </label>
                {nicknames.map((n) => (
                  <label key={n} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="displayChoice"
                      checked={displayChoice === n}
                      onChange={() => setDisplayChoice(n)}
                    />
                    {n}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-ash mb-1">聯絡 Email（給其他社員約拍聯絡用，可以跟登入信箱不同）</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-seam rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-ash mb-1">Instagram</label>
              <input
                value={igId}
                onChange={(e) => setIgId(e.target.value)}
                placeholder="不用加 @，留空的話列表上不會顯示"
                className="w-full border border-seam rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-ash mb-1">電話（只有管理員看得到，社員名單不會顯示）</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="留空也沒關係"
                className="w-full border border-seam rounded px-3 py-2 text-sm"
              />
            </div>

            {error && <p className="text-red-700 text-xs">{error}</p>}
            {saved && <p className="text-moss text-xs">已儲存</p>}

            <button
              type="submit"
              disabled={saving}
              className="text-sm px-5 py-3 rounded bg-moss text-paper font-medium disabled:opacity-50 self-start"
            >
              {saving ? "儲存中..." : "儲存變更"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
